import ChainInsertor from './ChainInsertor'


export default class CheckboxChainInsertor extends ChainInsertor {
    insert(fieldObject, fieldId, fieldTypeId, fieldTableName) {
        if (fieldObject.tipo != 'checkbox')
            return this.next && this.next.insert(fieldObject, fieldId, fieldTypeId, fieldTableName)

        //Sentry.captureMessage(fieldObject)
        this.db.runSync(
            `INSERT INTO ${fieldTableName} (fk_field, max_checked_options, is_required) VALUES (?,?,?)`,
            [fieldId, fieldObject["cantidad de elecciones"], fieldObject.obligatorio]
        )
        const insertedRowId = this.db.getFirstSync('select last_insert_rowid() as id')
        //Sentry.captureMessage('insertedRowId', insertedRowId)

        fieldObject.opciones?.forEach(option =>
            this.db.runSync(
                `INSERT INTO checkbox_options (fk_checkbox_id, name, value) VALUES (?, ?, ?)`,
                [insertedRowId.id, option.nombre, option.valor]
            ))
        return true
    }
    delete(fieldId, fieldTableName, fieldTypeName) {
        if (fieldTypeName != 'checkbox')
            return this.next && this.next.delete(fieldId, fieldTableName, fieldTypeName)

        const id_options = this.db.getFirstSync(
            `SELECT id_options FROM ${fieldTableName} WHERE fk_field = ?`,
            [fieldId]
        ).id_options

        this.db.runSync(
            `DELETE FROM checkbox_options WHERE fk_checkbox_id = ?`,
            [id_options]
        )

        this.db.runSync(
            `DELETE FROM ${fieldTableName} WHERE fk_field = ?`,
            [fieldId]
        )
        return true
    }
    getFieldProperties(fieldId, fieldTableName, fieldTypeName) {
        if (fieldTypeName != 'checkbox')
            return this.next && this.next.getFieldProperties(fieldId, fieldTableName, fieldTypeName)

        const fieldProperties = this.db.getFirstSync(
            `SELECT id_options, max_checked_options, is_required FROM ${fieldTableName} WHERE fk_field = ?`,
            [fieldId]
        )
        const optionsQuery = this.db.getAllSync(
            `SELECT name, value FROM checkbox_options WHERE fk_checkbox_id = ?`,
            [fieldProperties.id_options]
        )

        return {
            tipo        : 'checkbox',
            obligatorio : !!fieldProperties.is_required,
            opciones    : optionsQuery.map(option => ({ nombre: option.name, valor: option.value })),
            "cantidad de elecciones": fieldProperties.max_checked_options,
        }
    }
}
