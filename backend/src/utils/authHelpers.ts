import bcrypt from 'bcryptjs';

// Валидация данных
export const validateAuthData = (data: any, requiredFields: string[]) => {
    for (const field of requiredFields) {
        if (!data[field]) {
            throw new Error(`Поле ${field} обязательно для заполнения`);
        }
    }
}

// Создание ответа с пользователем
export const createAuthResponse = (user: any, tokens: any) => {
    const { password, ...userWithoutPassword } = user;
    return {
        message: 'Успешно',
        accessToken: tokens.accessToken,
        user: userWithoutPassword
    };
};

// Проверка пароля
export const verifyPassword = async (password: string, hashedPassword: string) => {
    if (!hashedPassword) {
        throw new Error('У пользователя нет пароля');
    }
    
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
        throw new Error('Неверный пароль');
    }
};