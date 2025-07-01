import React from "react"
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components"
import * as eva from "@eva-design/eva"
import { EvaIconsPack } from '@ui-kitten/eva-icons'

import { FormProvider } from './context/SelectedFormContext'
import { IdentifierProvider } from './context/IdentifierContext'
import { SQLiteProvider } from 'expo-sqlite'
import { initializeDataBase } from './database/database'

import Menu from "./screens/Menu"
import FormSelectorScreen from "./screens/FormSelectorScreen" // Importa tu pantalla de selección de formularios
import FormFiller from "./screens/FormFiller"
import SavedForms from "./screens/SavedFormsScreen"
import Settings from "./screens/Settings"
import FormEditor from './screens/FormEditor'

import * as Sentry from "@sentry/react-native"

Sentry.init({
  dsn: "https://3efb87638329ad5c5461415382fffe62@o4509477660393472.ingest.de.sentry.io/4509477674090576",
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  enableInExpoDevelopment: true,
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
})

const myTheme = {
  ...eva.light,
  'color-primary-default': '#28a745',
  'color-primary-active': '#00c17f',
  'color-primary-hover': '#60e0b5',

  'color-info-default': '#2196F3',   // Azul normal
  'color-info-active': '#1976D2',    // Azul oscuro al presionar
  'color-info-hover': '#64B5F6',     // Azul claro en hover

  'color-danger-default': '#f44336',    // Rojo normal
  'color-danger-active': '#d32f2f',     // Rojo oscuro al presionar
  'color-danger-hover': '#e57373',      // Rojo claro en hover

  'color-gray-default': '#9e9e9e',      // Gris normal
  'color-gray-active': '#757575',       // Gris oscuro al presionar
  'color-gray-hover': '#bdbdbd',        // Gris claro en hover

  'color-custom-default': '#00b7ae',    // El color personalizado
  'color-custom-active': '#009f8d',     // Color oscuro al presionar
  'color-custom-hover': '#33bfa6',      // Color claro en hover

};

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <>
      <Sentry.ErrorBoundary>
        <IconRegistry icons={EvaIconsPack} />
        <SQLiteProvider databaseName="forms.db" onInit={initializeDataBase}>
          <ApplicationProvider {...eva} theme={myTheme}>
            <NavigationContainer>
              <FormProvider>
                <IdentifierProvider>
                  <Stack.Navigator initialRouteName="Menu">
                    <Stack.Screen name="Menu" component={Menu} options={{ headerShown: false }} />
                    <Stack.Screen name="FormSelector" component={FormSelectorScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="SavedForms" component={SavedForms} options={{ headerShown: false }} />
                    <Stack.Screen name="FormFiller" component={FormFiller} options={{ headerShown: false }} />
                    <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
                    <Stack.Screen name="FormEditor" component={FormEditor} options={{ headerShown: false }} />
                  </Stack.Navigator>
                </IdentifierProvider>
              </FormProvider>
            </NavigationContainer>
          </ApplicationProvider>
        </SQLiteProvider>
      </Sentry.ErrorBoundary>
    </>
  )
}
