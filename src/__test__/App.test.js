import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App.js'; // Ajustá la ruta según tu estructura

test('Renderiza correctamente la pantalla inicial', async () => {
    const { findByText } = render(<App />);

  // Asegúrate de usar un texto que esté en la pantalla "Menu"
    const menuScreenText = await findByText('Menu'); 

    expect(menuScreenText).toBeTruthy();
});
