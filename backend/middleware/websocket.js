/**
 * Enterprise WebSocket Middleware
 * 
 * Real-time communication system for MEWAYZ Platform
 * Supports real-time notifications, live data updates, and collaborative features
 * 
 * Features:
 * - Authenticated WebSocket connections
 * - Room-based messaging (organizations, projects, teams)
 * - Real-time analytics and dashboard updates
 * - Live notification delivery
 * - Collaborative editing support
 * - Enterprise security and monitoring
 */

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { verifyToken, auditLog } = require('./enterpriseAuth');
const User = require('../models/User');

class EnterpriseWebSocketManager {
  constructor() {
    this.wss = null;
    this.connections = new Map();
    this.rooms = new Map();
    this.heartbeatInterval = 30000; // 30 seconds
    this.maxConnections = 10000;
    this.connectionCount = 0;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws',
      maxPayload: 16 * 1024, // 16KB max payload
      perMessageDeflate: true // Enable compression
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', this.handleServerError.bind(this));

    // Start heartbeat monitoring
    this.startHeartbeat();

    console.log('✅ Enterprise WebSocket Server initialized');
  }

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(ws, req) {
    const connectionId = this.generateConnectionId();
    
    try {
      // Check connection limits
      if (this.connectionCount >= this.maxConnections) {
        ws.close(1013, 'Server capacity reached');
        return;
      }

      // Authenticate connection
      const user = await this.authenticateConnection(req);
      if (!user) {
        ws.close(1008, 'Authentication required');
        return;
      }

      // Initialize connection
      const connection = {
        id: connectionId,
        ws,
        user,
        isAlive: true,
        connectedAt: new Date(),
        lastActivity: new Date(),
        rooms: new Set(),
        metadata: {
          ip: req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      };

      this.connections.set(connectionId, connection);
      this.connectionCount++;

      // Setup connection handlers
      ws.on('message', (message) => this.handleMessage(connectionId, message));
      ws.on('close', () => this.handleDisconnection(connectionId));
      ws.on('error', (error) => this.handleConnectionError(connectionId, error));
      ws.on('pong', () => this.handlePong(connectionId));

      // Send welcome message
      this.sendToConnection(connectionId, {
        type: 'connection_established',
        connectionId,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          plan: user.plan
        },
        serverTime: new Date().toISOString()
      });

      // Auto-join user to their organization room
      if (user.organizationId) {
        this.joinRoom(connectionId, `org_${user.organizationId}`);
      }

      // Auto-join user to their personal notifications room
      this.joinRoom(connectionId, `user_${user._id}`);

      // Audit log
      await auditLog(req, 'WEBSOCKET_CONNECTION_ESTABLISHED', user, true, {
        connectionId,
        ip: connection.metadata.ip
      });

      console.log(`✅ WebSocket connection established: ${user.email} (${connectionId})`);

    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      ws.close(1011, 'Server error');
    }
  }

  /**
   * Authenticate WebSocket connection
   */
  async authenticateConnection(req) {
    try {
      // Extract token from query parameters or headers
      const token = req.url.includes('token=') 
        ? new URL(req.url, 'http://localhost').searchParams.get('token')
        : req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return null;
      }

      // Verify token
      const decoded = verifyToken(token);
      
      // Find user
      const user = await User.findById(decoded.id).select('+status');
      
      if (!user || user.status !== 'active') {
        return null;
      }

      return user;

    } catch (error) {
      console.error('WebSocket authentication error:', error);
      return null;
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  async handleMessage(connectionId, message) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      const data = JSON.parse(message);
      connection.lastActivity = new Date();

      // Validate message structure
      if (!data.type) {
        this.sendError(connectionId, 'Message type required');
        return;
      }

      // Handle different message types
      switch (data.type) {
        case 'ping':
          this.handlePing(connectionId);
          break;
        
        case 'join_room':
          await this.handleJoinRoom(connectionId, data);
          break;
        
        case 'leave_room':
          this.handleLeaveRoom(connectionId, data);
          break;
        
        case 'send_message':
          await this.handleSendMessage(connectionId, data);
          break;
        
        case 'subscribe_analytics':
          await this.handleSubscribeAnalytics(connectionId, data);
          break;
        
        case 'update_presence':
          await this.handleUpdatePresence(connectionId, data);
          break;
        
        default:
          this.sendError(connectionId, `Unknown message type: ${data.type}`);
      }

    } catch (error) {
      console.error('WebSocket message handling error:', error);
      this.sendError(connectionId, 'Invalid message format');
    }
  }

  /**
   * Handle ping message
   */
  handlePing(connectionId) {
    this.sendToConnection(connectionId, {
      type: 'pong',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle pong response
   */
  handlePong(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.isAlive = true;
      connection.lastActivity = new Date();
    }
  }

  /**
   * Handle join room request
   */
  async handleJoinRoom(connectionId, data) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { room, permissions } = data;
    
    // Validate room access
    if (!await this.validateRoomAccess(connection.user, room, permissions)) {
      this.sendError(connectionId, 'Access denied to room');
      return;
    }

    this.joinRoom(connectionId, room);
    
    this.sendToConnection(connectionId, {
      type: 'room_joined',
      room,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle leave room request
   */
  handleLeaveRoom(connectionId, data) {
    const { room } = data;
    this.leaveRoom(connectionId, room);
    
    this.sendToConnection(connectionId, {
      type: 'room_left',
      room,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle send message to room
   */
  async handleSendMessage(connectionId, data) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { room, message, messageType = 'chat' } = data;

    // Validate room membership
    if (!connection.rooms.has(room)) {
      this.sendError(connectionId, 'Not a member of this room');
      return;
    }

    // Broadcast message to room
    this.broadcastToRoom(room, {
      type: 'room_message',
      room,
      messageType,
      message,
      sender: {
        id: connection.user._id,
        name: connection.user.name,
        role: connection.user.role
      },
      timestamp: new Date().toISOString()
    }, connectionId); // Exclude sender
  }

  /**
   * Handle analytics subscription
   */
  async handleSubscribeAnalytics(connectionId, data) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { dashboardId, metrics } = data;

    // Validate analytics access
    if (!await this.validateAnalyticsAccess(connection.user, dashboardId)) {
      this.sendError(connectionId, 'Access denied to analytics');
      return;
    }

    // Subscribe to analytics room
    const analyticsRoom = `analytics_${dashboardId}`;
    this.joinRoom(connectionId, analyticsRoom);

    // Send initial analytics data
    // This would be populated with real analytics data
    this.sendToConnection(connectionId, {
      type: 'analytics_data',
      dashboardId,
      metrics: {
        // Real-time metrics would go here
        activeUsers: this.connectionCount,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Handle presence update
   */
  async handleUpdatePresence(connectionId, data) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { status, activity } = data;

    // Update user presence in database
    await User.findByIdAndUpdate(connection.user._id, {
      'presence.status': status,
      'presence.activity': activity,
      'presence.lastSeen': new Date()
    });

    // Broadcast presence update to relevant rooms
    connection.rooms.forEach(room => {
      this.broadcastToRoom(room, {
        type: 'presence_update',
        user: {
          id: connection.user._id,
          name: connection.user.name
        },
        presence: { status, activity },
        timestamp: new Date().toISOString()
      }, connectionId);
    });
  }

  /**
   * Validate room access
   */
  async validateRoomAccess(user, room, permissions = []) {
    // Room access logic based on user role and organization
    if (room.startsWith('org_')) {
      const orgId = room.replace('org_', '');
      return user.organizationId && user.organizationId.toString() === orgId;
    }

    if (room.startsWith('user_')) {
      const userId = room.replace('user_', '');
      return user._id.toString() === userId || user.role === 'admin';
    }

    if (room.startsWith('admin_')) {
      return ['admin', 'super_admin'].includes(user.role);
    }

    // Default: allow access for authenticated users
    return true;
  }

  /**
   * Validate analytics access
   */
  async validateAnalyticsAccess(user, dashboardId) {
    // Analytics access validation logic
    return user.plan !== 'Free' || user.role === 'admin';
  }

  /**
   * Join room
   */
  joinRoom(connectionId, room) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.rooms.add(room);

    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    
    this.rooms.get(room).add(connectionId);
  }

  /**
   * Leave room
   */
  leaveRoom(connectionId, room) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.rooms.delete(room);
    }

    const roomConnections = this.rooms.get(room);
    if (roomConnections) {
      roomConnections.delete(connectionId);
      
      // Clean up empty rooms
      if (roomConnections.size === 0) {
        this.rooms.delete(room);
      }
    }
  }

  /**
   * Send message to specific connection
   */
  sendToConnection(connectionId, data) {
    const connection = this.connections.get(connectionId);
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      try {
        connection.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error(`Failed to send message to connection ${connectionId}:`, error);
      }
    }
  }

  /**
   * Send error message
   */
  sendError(connectionId, message) {
    this.sendToConnection(connectionId, {
      type: 'error',
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast to room
   */
  broadcastToRoom(room, data, excludeConnectionId = null) {
    const roomConnections = this.rooms.get(room);
    if (!roomConnections) return;

    roomConnections.forEach(connectionId => {
      if (connectionId !== excludeConnectionId) {
        this.sendToConnection(connectionId, data);
      }
    });
  }

  /**
   * Broadcast to user
   */
  broadcastToUser(userId, data) {
    const userRoom = `user_${userId}`;
    this.broadcastToRoom(userRoom, data);
  }

  /**
   * Broadcast to organization
   */
  broadcastToOrganization(organizationId, data) {
    const orgRoom = `org_${organizationId}`;
    this.broadcastToRoom(orgRoom, data);
  }

  /**
   * Handle connection disconnection
   */
  handleDisconnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Leave all rooms
    connection.rooms.forEach(room => {
      this.leaveRoom(connectionId, room);
    });

    // Remove connection
    this.connections.delete(connectionId);
    this.connectionCount--;

    console.log(`❌ WebSocket disconnection: ${connection.user.email} (${connectionId})`);
  }

  /**
   * Handle connection error
   */
  handleConnectionError(connectionId, error) {
    console.error(`WebSocket connection error (${connectionId}):`, error);
    // Connection will be automatically cleaned up by close handler
  }

  /**
   * Handle server error
   */
  handleServerError(error) {
    console.error('WebSocket server error:', error);
  }

  /**
   * Start heartbeat monitoring
   */
  startHeartbeat() {
    setInterval(() => {
      this.wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
          ws.terminate();
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, this.heartbeatInterval);
  }

  /**
   * Generate unique connection ID
   */
  generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      totalConnections: this.connectionCount,
      totalRooms: this.rooms.size,
      connectionsPerRoom: Array.from(this.rooms.entries()).map(([room, connections]) => ({
        room,
        connections: connections.size
      }))
    };
  }

  /**
   * Close all connections
   */
  shutdown() {
    console.log('🔴 Shutting down WebSocket server...');
    
    this.connections.forEach((connection, connectionId) => {
      connection.ws.close(1001, 'Server shutdown');
      this.connections.delete(connectionId);
    });

    this.rooms.clear();
    this.connectionCount = 0;

    if (this.wss) {
      this.wss.close();
    }
  }
}

// Create singleton instance
const webSocketManager = new EnterpriseWebSocketManager();

module.exports = {
  webSocketManager,
  EnterpriseWebSocketManager
}; 