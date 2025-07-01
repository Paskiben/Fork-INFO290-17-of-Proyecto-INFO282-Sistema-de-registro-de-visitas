global.__DEV__ = true; // Define que estamos en el entorno de desarrollo
jest.mock('react-native/Libraries/Utilities/Platform', () => {
    return {
        OS: 'ios', // or 'android', depending on your environment
        select: (platforms) => platforms.ios,
    };
});
  