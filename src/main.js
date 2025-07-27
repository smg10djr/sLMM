import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// 다크모드 CSS 테마 로드
import '@/assets/themes/dark-mode.css';

// 임시로 SCSS 로딩 비활성화 (흰 페이지 문제 해결을 위해)
// import '@/assets/styles.scss';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');
