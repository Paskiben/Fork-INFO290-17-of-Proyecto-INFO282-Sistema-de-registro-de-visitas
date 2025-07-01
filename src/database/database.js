import TextChainInsertor from './componentInsertor/TextChainInsertor'
import SelectorChainInsertor from './componentInsertor/SelectorChainInsertor'
import DateChainInsertor from './componentInsertor/DateChainInsertor'
import TimeChainInsertor from './componentInsertor/TimeChainInsertor'
import CameraChainInsertor from './componentInsertor/CameraChainInsertor'
import CheckboxChainInsertor from './componentInsertor/CheckboxChainInsertor'
import RadioChainInsertor from './componentInsertor/RadiusChainInsertor'
import initDatabaseScript from './tables'
import * as Sentry from '@sentry/react-native'

const { dbInit } = initDatabaseScript
const tables = ['forms', 'fields', 'field_table_name', 'text_properties', 'selector_properties', 'checkbox_properties', 'radio_properties', 'date_properties', 'hour_properties', 'camera_properties', 'limitations',
    'format', 'is_formatted', 'limitations_intermediary', 'selector_options', 'radio_options', 'checkbox_options', 'compatibility_matrix', 'respuestas', 'campo_respuesta']
const table_types = [['text_properties', 'texto'], ['selector_properties', 'selector'], ['checkbox_properties', 'checkbox'], ['radio_properties', 'radio'], ['date_properties', 'fecha'], ['hour_properties', 'hora'], ['camera_properties', 'camara']]

/**
 * Guarda si dos elementos son compatibles
 * @param {Number} firstElement "Primer elemento de la matriz de compatibilidad"
 * @param {Number} secondElement "Segundo elemento de la matriz de compatibilidad"
 * @param {String} typenameOfField ""Nombre del tipo de campo"
 * @param {boolean} isCompatible "Indica si los elementos son compatibles, true si lo son, false si no"
 * @param {[Number]} isFormat "1 si es formato, 0 si es limitacion"
 */
export const setCompatibility = (db, firstElement, secondElement, typenameOfField, isCompatible, isFormat) => {
    if (firstElement == secondElement) return 'Ok'
    if (firstElement > secondElement) secondElement = [firstElement, firstElement = secondElement][0]

    const fieldTypeId = db.getFirstSync('SELECT id FROM field_table_name WHERE field_type_name = ?', [typenameOfField]).id
    if (isCompatible)
        return db.runSync('INSERT INTO compatibility_matrix (fila, columna, fk_field_type_id, limitation_or_format) VALUES (?,?,?,?)', [firstElement, secondElement, fieldTypeId, isFormat])
    return db.runSync('DELETE FROM compatibility_matrix WHERE fila = ? AND columna = ? AND fk_field_type_id = ? AND limitation_or_format = ?', [firstElement, secondElement, fieldTypeId, isFormat])
}


export async function initializeDataBase(db) {
    try {
        db.execSync(dbInit);
        Sentry.captureMessage('Database initialized');
    } catch (error) {
        Sentry.captureException(error);
    }

    table_types.forEach(type => {
        if (!typeExists(db, type[0], type[1])) {
            db.runSync('INSERT INTO field_table_name (table_name, field_type_name) VALUES (?,?)', type);
        }
    });

    const limitations = [
        ["solo letras", String.raw`/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/`, "default", 0],
        ["solo numeros", String.raw`/^-?\d+([.,]\d+)?$/`, "numeric", 1],
        ["solo enteros", String.raw`/^-?\d+$/`, "numeric", 2],
        ["solo enteros positivos y cero", String.raw`/^\d+$/`, "numeric", 3],
        ["email", String.raw`/^(([^<>()[\]\.,:\s@\"]+(\.[^<>()[\]\.,:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,:\s@\"]+\.)+[^<>()[\]\.,:\s@\"]{2,})$/i`, "default", 4],
        ["no numeros", String.raw`/^[^\d]*$/`, "default", 5],
        ["editable",null, "default" , 0],
        ["no editable",null, "default", 1]
    ];
    const formats = [
        ["solo minusculas", 1],
        ["solo mayusculas", 0]
    ]

    limitations.forEach(limitation => {
        const [name, regex, keyboardType, valueEnumMatrix] = limitation;
        const result = db.getFirstSync("SELECT 1 FROM limitations WHERE name = ?", [name]);
        if (!result) {
            db.runSync('INSERT INTO limitations (name, regex, keyboard_type, value_enum_matrix) VALUES (?,?,?,?)', limitation);
        }
    })
    formats.forEach(format => {
        const [name, valueEnumMatrix] = format;
        const result = db.getFirstSync("SELECT 1 FROM format WHERE name = ?", [name]);
        if (!result) {
            db.runSync('INSERT INTO format (name, value_enum_matrix) VALUES (?,?)', format);
        }
    })

    ;[[1, 2], [1, 3], [2, 3]].forEach(pair => setCompatibility(db, pair[0], pair[1], "texto", 1, 0))

}

function typeExists(db, tableName, fieldTypeName) {
    const result = db.getFirstSync("SELECT 1 FROM field_table_name WHERE table_name = ? AND field_type_name = ?", [tableName, fieldTypeName]);
    return result !== null && result !== undefined
}


// Singleton factory method to get the instance
let instance = null

function formExists(db, formName) {
    const result = db.getFirstSync("SELECT name FROM forms WHERE name=?", [formName])
    return result !== null;
}

export function getDatabaseInstance(db) {
    if (!instance) {
        instance = new Database(db)
        const testForms = require('../TestForms/forms.json')
        testForms.forEach(test => {
            if (!formExists(db, test["nombre formulario"])) {
                instance.addForm(test);
            }
        })
    }
    return instance
}

export function resetDatabase(instance){
    const tables = [
        'campo_respuesta',
        'respuestas',
        'compatibility_matrix',
        'checkbox_options',
        'radio_options',
        'selector_options',
        'is_formatted',
        'format',
        'limitations_intermediary',
        'limitations',
        'camera_properties',
        'hour_properties',
        'date_properties',
        'radio_properties',
        'checkbox_properties',
        'selector_properties',
        'text_properties',
        'fields',
        'field_table_name',
        'forms'
    ];

    tables.forEach(table => {
        instance.db.runSync(`DROP TABLE IF EXISTS ${table}`);
    })

    initializeDataBase(instance.db)
    const testForms = require('../TestForms/forms.json')
        testForms.forEach(test => {
            instance.addForm(test)
    })
}

export default class Database {
    constructor(db) {
        if (Database.instance) return Database.instance


        this.db = db
        this.chainInsertors = new TextChainInsertor(this.db)
        this.chainInsertors
            .add(new SelectorChainInsertor(this.db))
            .add(new DateChainInsertor(this.db))
            .add(new TimeChainInsertor(this.db))
            .add(new CameraChainInsertor(this.db))
            .add(new CheckboxChainInsertor(this.db))
            .add(new RadioChainInsertor(this.db))

        Database.instance = this // Cache the instance
    }

    getAllFormNames() {
        try {
            return this.db.getAllSync('SELECT name FROM forms').map(form => form.name)
        } catch (error) {
            Sentry.captureException('getAllFormNames:', error)
            Sentry.captureException('trace:', error.stack)
        }
    }

    getAllForms() {
        try {
            const forms = this.db.getAllSync('SELECT name FROM forms')
            return forms.map(form => this.getForm(form.name))
        } catch (error) {
            Sentry.captureException('getAllForms', error)
            Sentry.captureException('trace:', error.stack)
        }
    }

    getForm(nombreFormulario) {
        try {
            const { id: formID, last_modification: ultimaModificacion } = this.db.getFirstSync('SELECT id,last_modification FROM forms WHERE name = ?', [nombreFormulario])
            const fields = this.db.getAllSync('SELECT id,fk_field_table_name,name,ordering,output FROM fields WHERE fk_id_form = ?', [formID])

            const outputForm = {
                "nombre formulario": nombreFormulario,
                "ultima modificacion": ultimaModificacion
            }

            const outputFields = new Array(fields.length)
            fields.forEach(field => {
                const {
                    id: fieldID,
                    fk_field_table_name: typeID,
                    name: fieldName,
                    ordering: posicion,
                    output: salidaCampo
                } = field

                const outputField = {
                    "nombre"    : fieldName,
                    "salida"    : salidaCampo,
                }

                const { table_name: typeTableName, field_type_name: fieldTypeName } = this.db.getFirstSync('SELECT table_name,field_type_name FROM field_table_name WHERE id = ?', [typeID])
                const fieldTypeProperties = this.chainInsertors.getFieldProperties(fieldID, typeTableName, fieldTypeName)

                Object.assign(outputField, fieldTypeProperties)

                outputFields[posicion] = outputField
            })
            outputForm.campos = outputFields

            return outputForm

        } catch (error) {
            Sentry.captureException('getForm: ', error)
            Sentry.captureException('trace:', error.stack)
            Sentry.captureException('input:', nombreFormulario)
        }
    }

    getAllAnswers() {
        try {
            const answers = this.db.getAllSync('SELECT id_respuesta FROM respuestas')
            return answers.map(answer => this.getAnswer(answer['id_respuesta']))
        } catch (error) {
            Sentry.captureException('getAllAnswers:', error)
            Sentry.captureException('trace:', error.stack)
        }
    }
    getAnswerFromFormTemplate(formName) {
        try {
            const answers = this.db.getAllSync('SELECT id FROM forms WHERE name = ?', [formName])
            return answers.map(answer => this.getAnswer(answer['id_respuesta']))
        } catch (error) {
            Sentry.captureException('getAnswerFromFormTemplate:', error)
            Sentry.captureException('trace:', error.stack)
            Sentry.captureException('input:', formName)
        }
    }
    getAnswer(idRespuesta) {
        try {
            const answer = this.db.getFirstSync('SELECT * FROM respuestas WHERE id_respuesta = ?', [idRespuesta])
            const fields = this.db.getAllSync('SELECT enum_tipo_campo, nombre_campo, valor_campo FROM campo_respuesta WHERE id_respuesta = ?', [idRespuesta])
            const formName = this.db.getFirstSync('SELECT name FROM forms WHERE id = ?', [answer.id_plantilla]).name

            let data = {}
            fields.map(field => {
                const tipoCampo = this.db.getFirstSync('select field_type_name from field_table_name where id = ?', [field.enum_tipo_campo]).field_type_name
                data[field.nombre_campo] = [tipoCampo, field.valor_campo]
            })

            return {
                'plantilla': formName,
                'fecha': answer.fecha_respuesta,
                'um plantilla': answer.um_plantilla,
                'idDispositivo': answer.id_dispositivo,
                'data': data
            }

        } catch (error) {
            Sentry.captureException('getAnswer:', error)
            Sentry.captureException('trace:', error.stack)
            Sentry.captureException('input:', idRespuesta)
        }
    }

    addForm(newForm) {
        try {
            this.db.runSync(
                'INSERT INTO forms (name, last_modification) VALUES (?,?)',
                [newForm["nombre formulario"], newForm["ultima modificacion"]]
            )
            const formID = this.db.getFirstSync('SELECT last_insert_rowid() AS id').id

            newForm.campos.forEach((fieldObject, i) => {
                const { id: typeOfField, table_name: fieldTableName } = this.db.getFirstSync('SELECT id, table_name FROM field_table_name WHERE field_type_name=?', [fieldObject.tipo])

                this.db.runSync(
                    'INSERT INTO fields (fk_id_form, fk_field_table_name, name, ordering, output) VALUES (?,?,?,?,?)',
                    [formID, typeOfField, fieldObject.nombre, i, fieldObject.salida]
                )
                const lastFieldId = this.db.getFirstSync('SELECT last_insert_rowid() AS id').id
                const tryInsert = this.chainInsertors.insert(fieldObject, lastFieldId, typeOfField, fieldTableName)

                if (tryInsert === false) {
                    /* Aqui hay que borrar de la tabla de forms hasta este campo, luego, seleccionar todos los campos de la tabla fields que tengan el id del form y borrarlos de la tabla fields */
                    throw new Error(`Tipo de campo desconocido ${fieldObject.tipo}`)
                }
            })
        } catch (error) {
            Sentry.captureException('addForm:', error)
            Sentry.captureException('trace:', error.stack)
            Sentry.captureException('input:', JSON.stringify(newForm, undefined, 2))
        }
    }

    deleteForm(formName) {
        try {
            const formID = this.db.getFirstSync('SELECT id FROM forms WHERE name = ?', [formName]).id

            const fieldsID = this.db.getAllSync('SELECT id, fk_field_table_name FROM fields WHERE fk_id_form = ?', [formID])
            Sentry.captureMessage(fieldsID)
            fieldsID.forEach(field => {
                Sentry.captureMessage('iteration start')
                const fieldTableName = this.db.getFirstSync('SELECT table_name FROM field_table_name WHERE id = ?', [field.fk_field_table_name]).table_name
                Sentry.captureMessage('first query')
                const fieldTypeName = this.db.getFirstSync('SELECT field_type_name FROM field_table_name WHERE id = ?', [field.fk_field_table_name]).field_type_name
                Sentry.captureMessage('second query')
                //if (!this.chainInsertors.delete(field.id, fieldTableName)) throw new Error('Error al eliminar')
                this.chainInsertors.delete(field.id, fieldTableName, fieldTypeName)
                Sentry.captureMessage("Outside")
                this.db.runSync('DELETE FROM fields WHERE id = ?', [field.id])
                Sentry.captureMessage('iteration ended')
            })
            this.db.runSync('DELETE FROM forms WHERE id = ?', [formID])
        } catch (error) {
            Sentry.captureException('deleteForm:', error)
            Sentry.captureException('trace:', error.stack)
            Sentry.captureException('input:', formName)
        }
    }

    insertAnswer(answerObject) {
        const formID = this.db.getFirstSync('SELECT id FROM forms WHERE name = ?', [answerObject.plantilla]).id
        this.db.runSync(
            'INSERT INTO respuestas (id_plantilla, fecha_respuesta, um_plantilla, id_dispositivo) VALUES (?,?,?,?)',
            [formID, answerObject.fecha, answerObject["um plantilla"], answerObject["idDispositivo"]]
        )
        const lastAnswerID = this.db.getFirstSync('SELECT id_respuesta FROM respuestas ORDER BY id_respuesta DESC LIMIT 1')['id_respuesta']

        Object.entries(answerObject.data).forEach(([fieldOutput, [typeOfField, value]]) => {
            this.db.runSync(
                'INSERT INTO campo_respuesta (id_respuesta, enum_tipo_campo, nombre_campo, valor_campo) VALUES (?,?,?,?)',
                [lastAnswerID, this.db.getFirstSync('SELECT id from field_table_name where field_type_name = ?', typeOfField).id, fieldOutput, value.toString()]
            )
        })
    }

    deleteAnswers(answerDate) {
        this.db.runSync('DELETE FROM campo_respuesta WHERE id_respuesta = ?', [this.db.getFirstSync('SELECT id_respuesta FROM respuestas WHERE fecha_respuesta = ?', [answerDate]).id_respuesta])
        this.db.runSync('DELETE FROM respuestas WHERE fecha_respuesta = ?', [answerDate])
    }

    getComponnentTypeId(fieldType) {
        return this.db.getFirstSync('SELECT id FROM field_table_name WHERE field = ?', [fieldType]).id
    }

    isFormNameRepeated(formName) {
        const result = this.db.getFirstSync('SELECT 1 FROM forms WHERE name = ? LIMIT 1', [formName])
        return result === undefined
    }

    getRegexFromLimitation(limitationName) {
        return this.db.getFirstSync('SELECT regex FROM limitations WHERE name = ?', [limitationName]).regex
    }

    getKeyboardFromLimitation(limitationName) {
        return this.db.getFirstSync('SELECT keyboard_type FROM limitations WHERE name = ?', [limitationName]).keyboard_type
    }

    setIdToAnswers(newID){
        return this.db.getFirstSync('UPDATE respuestas SET id_dispositivo = ?',[newID])
    }
}   
