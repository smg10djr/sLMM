<script setup>
// Stagewise 플러그인 임시 비활성화
// import VuePlugin from '@stagewise-plugins/vue';
// import { StagewiseToolbar } from '@stagewise/toolbar-vue';

// const config = {
//     plugins: [VuePlugin]
// };

// const isDev = import.meta.env.DEV;
</script>

<template>
    <router-view />
    <!-- <StagewiseToolbar :config="config" v-if="isDev" /> -->
</template>

<style scoped></style>
