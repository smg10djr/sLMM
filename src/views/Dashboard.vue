<script setup>
// 위젯들을 임시로 비활성화하여 cx 오류 디버깅
// import BestSellingWidget from '@/components/dashboard/BestSellingWidget.vue';
// import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
// import RecentSalesWidget from '@/components/dashboard/RecentSalesWidget.vue';
// import RevenueStreamWidget from '@/components/dashboard/RevenueStreamWidget.vue';
// import StatsWidget from '@/components/dashboard/StatsWidget.vue';
</script>

<template>
    <div style="padding: 1.5rem;">
        <h1 style="font-size: 1.875rem; font-weight: bold; color: #111827; margin-bottom: 1.5rem;">
            물류관리 대시보드
        </h1>
        <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="color: #4b5563;">✅ 대시보드가 성공적으로 로드되었습니다!</p>
            <p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">
                기본 레이아웃 구조가 정상적으로 작동하고 있습니다.
            </p>
            <div style="margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 0.25rem;">
                <h3 style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                    완료된 기능:
                </h3>
                <ul style="list-style: none; padding: 0; margin: 0; color: #4b5563;">
                    <li>✅ 기본 레이아웃 구조</li>
                    <li>✅ 사이드바 접기/펼치기 (240px ↔ 60px)</li>
                    <li>✅ 반응형 브레이크포인트 (768px, 1024px)</li>
                    <li>✅ 라우터 연동</li>
                </ul>
            </div>
        </div>
    </div>
</template>
