// __tests__/addToDatabase.test.js
import { getDatabaseInstance } from "../database/database";

// Create a simple mock implementation of all the needed dependencies
const mockSQLite = {
  runSync: jest.fn(),
  getAllSync: jest.fn(),
  getFirstSync: jest.fn(),
  execSync: jest.fn()
};

// Mock the useSQLiteContext to return our mock
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => mockSQLite
}));

// Mock the chain insertors
jest.mock('../database/componentInsertor/TextChainInsertor', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnValue(true),
    getFieldProperties: jest.fn().mockReturnValue({
      tipo: 'texto',
      placeholder: 'Enter name',
      limitaciones: ['solo letras'],
      formato: ['solo mayusculas']
    }),
    delete: jest.fn().mockReturnValue(true)
  }));
});

jest.mock('../database/componentInsertor/SelectorChainInsertor', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnValue(true),
    getFieldProperties: jest.fn().mockReturnValue({
      tipo: 'selector',
      opciones: ['Chile', 'Argentina', 'Perú']
    }),
    delete: jest.fn().mockReturnValue(true)
  }));
});

// Mock other chain insertors with empty implementations
const createEmptyMock = () => jest.fn().mockImplementation(() => ({
  add: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnValue(false),
  getFieldProperties: jest.fn().mockReturnValue(null),
  delete: jest.fn().mockReturnValue(false)
}));

jest.mock('../database/componentInsertor/DateChainInsertor', () => createEmptyMock());
jest.mock('../database/componentInsertor/TimeChainInsertor', () => createEmptyMock());
jest.mock('../database/componentInsertor/CameraChainInsertor', () => createEmptyMock());
jest.mock('../database/componentInsertor/CheckboxChainInsertor', () => createEmptyMock());
jest.mock('../database/componentInsertor/RadiusChainInsertor', () => createEmptyMock());

// Mock the TestForms import
jest.mock('../TestForms/forms.json', () => [], { virtual: true });

// Set up database mock responses
const setupMockResponses = () => {
  // For getFirstSync
  mockSQLite.getFirstSync.mockImplementation((query, params) => {
    if (query.includes('SELECT id FROM field_table_name WHERE field_type_name')) {
      const fieldTypes = {
        'texto': { id: 1, table_name: 'text_properties' },
        'selector': { id: 2, table_name: 'selector_properties' },
        'fecha': { id: 3, table_name: 'date_properties' },
        'hora': { id: 4, table_name: 'hour_properties' },
        'camara': { id: 5, table_name: 'camera_properties' },
        'checkbox': { id: 6, table_name: 'checkbox_properties' },
        'radio': { id: 7, table_name: 'radio_properties' }
      };
      
      return fieldTypes[params[0]] || null;
    }
    
    if (query.includes('SELECT id, table_name FROM field_table_name WHERE field_type_name')) {
      const fieldTypes = {
        'texto': { id: 1, table_name: 'text_properties' },
        'selector': { id: 2, table_name: 'selector_properties' },
        'fecha': { id: 3, table_name: 'date_properties' },
        'hora': { id: 4, table_name: 'hour_properties' },
        'camara': { id: 5, table_name: 'camera_properties' },
        'checkbox': { id: 6, table_name: 'checkbox_properties' },
        'radio': { id: 7, table_name: 'radio_properties' }
      };
      
      return fieldTypes[params[0]] || null;
    }
    
    if (query.includes('SELECT last_insert_rowid()')) {
      return { id: 1 };
    }
    
    if (query.includes('SELECT 1 FROM field_table_name')) {
      return 1;
    }
    
    return null;
  });
};

describe('Database.addForm', () => {
  let db;
  
  beforeEach(() => {
    // Clear all mock implementations
    jest.clearAllMocks();
    
    // Setup mock responses
    setupMockResponses();
    
    // Get the database instance
    db = getDatabaseInstance(mockSQLite);
  });
  
  test('should correctly insert a form with valid fields', () => {
    const testForm = {
      "nombre formulario": "Test Form",
      "ultima modificacion": "2023-01-01",
      "campos": [
        {
          "tipo": "texto",
          "nombre": "Name",
          "salida": "name_output",
          "placeholder": "Enter name",
          "limitaciones": ["solo letras"],
          "formato": ["solo mayusculas"]
        },
        {
          "tipo": "selector",
          "nombre": "Country",
          "salida": "country_output",
          "opciones": ["Chile", "Argentina", "Perú"]
        }
      ]
    };
    
    // Execute the operation
    db.addForm(testForm);
    
    // Verify form was inserted
    expect(mockSQLite.runSync).toHaveBeenCalledWith(
      'INSERT INTO forms (name, last_modification) VALUES (?,?)',
      expect.arrayContaining(["Test Form", "2023-01-01"])
    );
    
    // Verify that at least one fields was inserted
    expect(mockSQLite.runSync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO fields'),
      expect.anything()
    );
  });
});
