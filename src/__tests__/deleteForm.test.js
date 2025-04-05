// __tests__/deleteForm.test.js

// Create a simple mock implementation for SQLite
const mockSQLite = {
  runSync: jest.fn(),
  getAllSync: jest.fn(),
  getFirstSync: jest.fn(),
  execSync: jest.fn()
};

// Mocking requires in database.js (same as in the addForm test)
jest.mock('../database/componentInsertor/TextChainInsertor', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnValue(true),
    getFieldProperties: jest.fn().mockReturnValue({
      tipo: 'texto',
      placeholder: 'Test placeholder'
    }),
    delete: jest.fn().mockReturnValue(true)
  }));
}, { virtual: true });

jest.mock('../database/componentInsertor/SelectorChainInsertor', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnValue(true),
    getFieldProperties: jest.fn().mockReturnValue({
      tipo: 'selector',
      opciones: ['Option 1', 'Option 2']
    }),
    delete: jest.fn().mockReturnValue(true)
  }));
}, { virtual: true });

// Mock other ChainInsertors directly instead of using a function
jest.mock('../database/componentInsertor/DateChainInsertor', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnValue(true),
    getFieldProperties: jest.fn(),
    delete: jest.fn().mockReturnValue(true)
  }));
}, { virtual: true });

jest.mock('../database/componentInsertor/TimeChainInsertor', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnValue(true),
    getFieldProperties: jest.fn(),
    delete: jest.fn().mockReturnValue(true)
  }));
}, { virtual: true });

jest.mock('../database/componentInsertor/CameraChainInsertor', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnValue(true),
    getFieldProperties: jest.fn(),
    delete: jest.fn().mockReturnValue(true)
  }));
}, { virtual: true });

jest.mock('../database/componentInsertor/CheckboxChainInsertor', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnValue(true),
    getFieldProperties: jest.fn(),
    delete: jest.fn().mockReturnValue(true)
  }));
}, { virtual: true });

jest.mock('../database/componentInsertor/RadioChainInsertor', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnValue(true),
    getFieldProperties: jest.fn(),
    delete: jest.fn().mockReturnValue(true)
  }));
}, { virtual: true });

// Mock the expo-sqlite module
jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => mockSQLite
}));

// Mock the test forms data
jest.mock('../TestForms/forms.json', () => [], { virtual: true });

// Import the database module after all mocks are in place
import { getDatabaseInstance } from "../database/database";

// Setup mock responses for SQL queries
const setupMockResponses = () => {
  // Mock form exists check
  mockSQLite.getFirstSync.mockImplementation((query, params) => {
    if (query.includes('SELECT id FROM forms WHERE name = ?')) {
      return { id: 1 }; // Form exists with ID 1
    }
    
    if (query.includes('SELECT table_name FROM field_table_name')) {
      return { table_name: 'text_properties' };
    }
    
    if (query.includes('SELECT field_type_name FROM field_table_name')) {
      return { field_type_name: 'texto' };
    }
    
    // Default response for any other query
    return null;
  });
  
  // Mock getAllSync to return field data
  mockSQLite.getAllSync.mockImplementation((query, params) => {
    if (query.includes('SELECT id, fk_field_table_name FROM fields')) {
      return [
        { id: 10, fk_field_table_name: 1 }, // Text field
        { id: 11, fk_field_table_name: 2 }  // Selector field
      ];
    }
    
    return [];
  });
};

describe('Database.deleteForm', () => {
  let db;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock responses
    setupMockResponses();
    
    // Get database instance
    db = getDatabaseInstance(mockSQLite);
  });
  
  test('should delete a form and its associated fields', () => {
    // Call the method under test
    db.deleteForm('Test Form');
    
    // Verify that the form ID was retrieved first
    expect(mockSQLite.getFirstSync).toHaveBeenCalledWith(
      'SELECT id FROM forms WHERE name = ?',
      ['Test Form']
    );
    
    // Verify that fields associated with the form were fetched
    expect(mockSQLite.getAllSync).toHaveBeenCalledWith(
      'SELECT id, fk_field_table_name FROM fields WHERE fk_id_form = ?',
      [1] // Form ID from the mock
    );
    
    // Verify that each field's properties were looked up
    expect(mockSQLite.getFirstSync).toHaveBeenCalledWith(
      'SELECT table_name FROM field_table_name WHERE id = ?',
      [1] // First field type ID
    );
    
    expect(mockSQLite.getFirstSync).toHaveBeenCalledWith(
      'SELECT field_type_name FROM field_table_name WHERE id = ?',
      [1] // First field type ID
    );
    
    // Verify that each field was deleted
    expect(mockSQLite.runSync).toHaveBeenCalledWith(
      'DELETE FROM fields WHERE id = ?',
      [10] // First field ID
    );
    
    expect(mockSQLite.runSync).toHaveBeenCalledWith(
      'DELETE FROM fields WHERE id = ?',
      [11] // Second field ID
    );
    
    // Verify that the form itself was deleted last
    expect(mockSQLite.runSync).toHaveBeenCalledWith(
      'DELETE FROM forms WHERE id = ?',
      [1]
    );
  });
  
  test('should handle errors gracefully when form does not exist', () => {
    // Override the mock for this specific test
    mockSQLite.getFirstSync.mockImplementationOnce((query) => {
      if (query.includes('SELECT id FROM forms WHERE name = ?')) {
        return null; // Form doesn't exist
      }
      return null;
    });
    
    // Create a spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Call the method under test
    db.deleteForm('NonExistentForm');
    
    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalled();
    
    // Verify no deletion queries were executed
    expect(mockSQLite.runSync).not.toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM forms'),
      expect.anything()
    );
    
    // Clean up spy
    consoleSpy.mockRestore();
  });
});
