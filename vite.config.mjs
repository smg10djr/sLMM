import { fileURLToPath, URL } from 'node:url';

import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    // 의존성 사전 번들링 최적화
    optimizeDeps: {
        noDiscovery: true,
        // 물류시스템에서 자주 사용되는 라이브러리들 사전 번들링
        include: [
            'vue',
            'vue-router',
            'primevue/config',
            '@primeuix/themes/aura',
            'chart.js'
        ],
        // 개발 서버 시작 시간 단축
        force: false
    },
    
    plugins: [
        vue({
            // Vue SFC 컴파일 최적화
            template: {
                compilerOptions: {
                    // 프로덕션 빌드에서 주석 제거
                    comments: false
                }
            }
        }),
        Components({
            resolvers: [PrimeVueResolver()],
            // 컴포넌트 자동 임포트 최적화
            dts: true,
            deep: true,
            dirs: ['src/components'],
            extensions: ['vue', 'ts', 'js']
        })
    ],
    
    // 개발 서버 설정
    server: {
        port: 3000,
        host: true, // 네트워크 접근 허용
        open: true, // 브라우저 자동 열기
        cors: true,
        // 핫 리로드 최적화
        hmr: {
            overlay: true
        },
        // 프록시 설정 (향후 백엔드 연동용)
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false
            }
        }
    },
    
    // 빌드 최적화
    build: {
        // 소스맵 생성 (개발용)
        sourcemap: true,
        // 청크 분할 최적화
        rollupOptions: {
            output: {
                manualChunks: {
                    // 벤더 라이브러리 분리
                    vendor: ['vue', 'vue-router'],
                    primevue: ['primevue/config'],
                    charts: ['chart.js']
                    // 파일 기반 청크는 자동으로 처리됨
                }
            }
        },
        // 최소화 옵션 (기본 esbuild 사용)
        minify: 'esbuild',
        // 프로덕션에서 console.log 제거
        esbuild: {
            drop: ['console', 'debugger']
        }
    },
    
    // 경로 별칭 설정
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
            '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
            '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
            '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
            '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
            '@assets': fileURLToPath(new URL('./src/assets', import.meta.url))
        }
    },
    
    // CSS 처리 최적화
    css: {
        devSourcemap: true,
        preprocessorOptions: {
            scss: {
                // SCSS 글로벌 변수 및 믹스인 (필요시 추가)
                // additionalData: `@import "@/assets/scss/_variables.scss";`
            }
        }
    },
    
    // 환경 변수 설정
    define: {
        __VUE_OPTIONS_API__: false, // Options API 비활성화로 번들 크기 감소
        __VUE_PROD_DEVTOOLS__: false
    }
});
