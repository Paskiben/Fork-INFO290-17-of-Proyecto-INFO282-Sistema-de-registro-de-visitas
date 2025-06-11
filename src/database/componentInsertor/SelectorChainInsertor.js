import ChainInsertor from './ChainInsertor'


export default class SelectorChainInsertor extends ChainInsertor {
    insert(fieldObject, fieldId, fieldTypeId, fieldTableName) {
        if (fieldObject.tipo != 'selector')
            return this.next && this.next.insert(fieldObject, fieldId, fieldTypeId, fieldTableName)
        this.db.runSync(
            `INSERT INTO ${fieldTableName} (fk_field, default_option, selector_placeholder, is_required) VALUES (?,?,?,?)`,
            [fieldId, fieldObject["opcion predeterminada"], fieldObject["texto predeterminado"], fieldObject.obligatorio]
        )

        const insertedRowId = this.db.getFirstSync('select last_insert_rowid() as id')

        fieldObject.opciones?.forEach(option =>
            this.db.runSync(
                `INSERT INTO selector_options (fk_selector_id, name, value) VALUES (?, ?, ?)`,
                [insertedRowId.id, option.nombre, option.valor]
            ))
        return true
    }
    delete(fieldId, fieldTableName, fieldTypeName) {
        if (fieldTypeName != 'selector')
            return this.next && this.next.delete(fieldId, fieldTableName, fieldTypeName)
        const id_options = this.db.getFirstSync(
            `SELECT id_options FROM ${fieldTableName} WHERE fk_field = ?`,
            [fieldId]
        ).id_options

        Sentry.captureMessage(id_options)
        this.db.runSync(
            'DELETE FROM selector_options WHERE fk_selector_id = ?',
            [id_options]
        )

        this.db.runSync(
            `DELETE FROM ${fieldTableName} WHERE fk_field = ?`,
            [fieldId]
        )
        return true
    }
    getFieldProperties(fieldId, fieldTableName, fieldTypeName) {
        if (fieldTypeName != 'selector')
            return this.next && this.next.getFieldProperties(fieldId, fieldTableName, fieldTypeName)

        const fieldProperties = this.db.getFirstSync(
            `SELECT id_options, default_option, selector_placeholder, is_required FROM ${fieldTableName} WHERE fk_field = ?`,
            [fieldId]
        )
        const optionsQuery = this.db.getAllSync(
            `SELECT name, value FROM selector_options WHERE fk_selector_id = ?`,
            [fieldProperties.id_options]
        )
        return {
            tipo: 'selector',
            obligatorio: !!fieldProperties.is_required,
            "opcion predeterminada": fieldProperties.default_option,
            "texto predeterminada": fieldProperties.selector_placeholder,
            opciones: optionsQuery.map(option => ({nombre: option.name, valor: option.value}))
        }
    }
}
