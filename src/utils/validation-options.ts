const validationOptions = {
    // 자동 타입 변환
    transform: true,
    transformOptions: {
        enableImplicitConversion: true
    },
    // DTO 에 없는 속성 무시
    whitelist: true
};

export default validationOptions;
