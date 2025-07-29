@echo off
echo ========================================
echo MEWAYZ Frontend - Core-2-Original Update
echo ========================================
echo.
echo This script helps identify pages that need to be updated
echo to use core-2-original components instead of shadcn/ui
echo.

echo Checking for pages using shadcn/ui components...
echo.

REM List all pages that import from @/components/ui/
findstr /s /i "@/components/ui/" frontend\app\*.tsx

echo.
echo ========================================
echo Pages that need updating:
echo ========================================
echo.
echo The following pages still use shadcn/ui components:
echo.
echo 1. webinars/page.tsx
echo 2. training/page.tsx  
echo 3. white-papers/page.tsx
echo 4. support-plans/page.tsx
echo 5. partners/page.tsx
echo 6. testimonials/page.tsx
echo 7. sitemap/page.tsx
echo 8. resources/page.tsx
echo 9. success-stories/page.tsx
echo 10. sla/page.tsx
echo 11. security/page.tsx
echo 12. roadmap/page.tsx
echo 13. marketplace/page.tsx
echo 14. maintenance/page.tsx
echo 15. newsletter/page.tsx
echo 16. downloads/page.tsx
echo 17. integration-hub/page.tsx
echo 18. feedback/page.tsx
echo 19. events/page.tsx
echo 20. enterprise-features/page.tsx
echo 21. cookies/page.tsx
echo 22. compliance/page.tsx
echo 23. compare/page.tsx
echo 24. case-studies/page.tsx
echo 25. community/page.tsx
echo 26. blog/page.tsx
echo 27. api-docs/page.tsx
echo 28. about/page.tsx
echo 29. contact/page.tsx
echo 30. features/page.tsx
echo 31. help/page.tsx
echo 32. legal/page.tsx
echo 33. press/page.tsx
echo 34. careers/page.tsx
echo 35. status/page.tsx
echo 36. terms/page.tsx
echo 37. privacy/page.tsx
echo 38. pricing/page.tsx
echo 39. upgrade-to-pro/page.tsx
echo 40. shop/page.tsx
echo 41. promote/page.tsx
echo 42. settings/page.tsx
echo 43. products/page.tsx
echo 44. onboarding/page.tsx
echo 45. messages/page.tsx
echo 46. notifications/page.tsx
echo 47. income/page.tsx
echo 48. explore-creators/page.tsx
echo 49. customers/page.tsx
echo 50. auth/page.tsx
echo 51. affiliate-center/page.tsx
echo 52. admin/page.tsx
echo.
echo ========================================
echo Update Status:
echo ========================================
echo.
echo COMPLETED:
echo - dashboard/page.tsx ✓
echo - error.tsx ✓
echo - not-found.tsx ✓
echo - loading.tsx ✓
echo - contact-sales/page.tsx ✓
echo - developer-portal/page.tsx ✓
echo - knowledge-base/page.tsx ✓
echo - support/page.tsx ✓
echo - courses/page.tsx ✓
echo.
echo REMAINING: 43 pages need updating
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Update each page to use core-2-original components
echo 2. Replace shadcn/ui imports with core-2-original imports
echo 3. Update component props to match core-2-original API
echo 4. Update CSS classes to use core-2-original variables
echo 5. Test each page for functionality
echo.
echo ========================================
pause 