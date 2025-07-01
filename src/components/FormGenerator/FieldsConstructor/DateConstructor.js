import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { Text, Input, Button, Datepicker, NativeDateService, Icon, CheckBox, Divider, List, ListItem } from '@ui-kitten/components'	
import * as Sentry from '@sentry/react-native'

const formats = [
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "YYYY/MM/DD",
    "YYYY/DD/MM",
    "MM/YYYY/DD",
    "DD/YYYY/MM"
]

const DateConstructor = ({ field = {}, onSave }) => {
    const [fieldName, setFieldName] = useState(field.name || "")
    const [defaultDate, setDefaultDate] = useState(field.defaultDate || "hoy")
    const [date, setDate] = useState(new Date())
    const [isNotEditable, setIsNotEditable] = useState(field.isNotEditable || false)
    const [dateFormat, setDateFormat] = useState("DD/MM/YYYY") // Formato por defecto

    const [showDefaultDate, setShowDefaultDate] = useState(false)
    const [showDefaultDatePicker, setShowDefaultDatePicker] = useState(false)
    const [showOptionalFeatures, setShowOptionalFeatures] = useState(false)
    const [showDateFormats, setShowDateFormats] = useState(false)

    // Obtiene la fecha actual en el formato solicitado
    const formatCurrentDate = format => {
        const today = new Date()
        const day = String(today.getDate()).padStart(2, "0")
        const month = String(today.getMonth() + 1).padStart(2, "0")
        const year = today.getFullYear()

        switch (format) {
            case "DD/MM/YYYY": return `${day}/${month}/${year}`
            case "MM/DD/YYYY": return `${month}/${day}/${year}`
            case "YYYY/MM/DD": return `${year}/${month}/${day}`
            case "YYYY/DD/MM": return `${year}/${day}/${month}`
            case "MM/YYYY/DD": return `${month}/${year}/${day}`
            case "DD/YYYY/MM": return `${day}/${year}/${month}`
            default: return `${day}/${month}/${year}`
        }
    }

    const configureDDateService = new NativeDateService('en', {
        startDayOfWeek:1,
        format: dateFormat
    })

    const handleSave = () => {
        if (!fieldName === "") {
            Alert.alert("Error", "El nombre del campo no puede estar vacío.")
            return
        }

        const field = {
            tipo: 'fecha',
            nombre: fieldName,
            salida: fieldName.toLowerCase().replace(/ /g, "_"),
            limitaciones: [isNotEditable ? "no editable" : "editable"],
            formato: dateFormat,
            "fecha predeterminada": defaultDate
        }

        if (onSave) {
            Sentry.captureMessage(field)
            onSave(field)
        }
    }

    React.useEffect(() => { handleSave() }, [fieldName, isNotEditable, dateFormat, defaultDate])

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{fieldName || 'Nuevo campo de Fecha'}</Text>

            <Divider/>

            <View style={styles.field}>
                <Input
                    label={"Nombre del Campo"}
                    value={fieldName}
                    onChangeText={nextName => setFieldName(nextName)}
                    placeholder="Nombre del campo"
                    style={styles.input}
                />
            </View>

            <Divider/>

            <View style={styles.field}>
                <TouchableOpacity style={styles.headerRow} onPress={() => setShowDateFormats(!showDateFormats)}>
                    <Text style={styles.subtitle}>Formato de Fecha</Text>
                    <Button
                        appearance='ghost'
                        accessoryLeft={props => <Icon name={showDateFormats ? 'arrow-ios-upward-outline' : 'arrow-ios-downward-outline'} {...props} />}
                        onPress={() => setShowDateFormats(!showDateFormats)}
                        style={styles.toggleButton}
                    />
                </TouchableOpacity>
                {showDateFormats && (
                    <View style={styles.buttonGroup}>
                        {formats.map((format) => (
                            <TouchableOpacity
                            key={format}
                            style={[
                                styles.formatButton,
                                dateFormat === format && styles.selectedFormatButton
                            ]}
                            onPress={() => setDateFormat(format)}
                            accessibilityLabel={`Formato de fecha ${format}`}
                            accessibilityRole="button"
                            >
                            <Text
                                style={[
                                styles.formatText,
                                dateFormat === format && styles.selectedFormatText
                                ]}
                            >
                                {format}
                            </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
            
            <Divider />

            <TouchableOpacity style={styles.headerRow} onPress={() => setShowDefaultDate(!showDefaultDate)}>
                <Text style={styles.subtitle}>Fecha predeterminada</Text>
                <Button
                    appearance='ghost'
                    accessoryLeft={(props) => <Icon name={showDefaultDate ? 'arrow-ios-upward-outline' : 'arrow-ios-downward-outline'} {...props} />}
                    onPress={() => setShowDefaultDate(!showDefaultDate)}
                    style={styles.toggleButton}
                />
            </TouchableOpacity>
            {showDefaultDate &&
                <View style={styles.submenu}>
                    <List data={[
                                { title: 'La fecha al momento de responder', checked: defaultDate === 'hoy', onPress: () => {setDefaultDate('hoy'); setShowDefaultDatePicker(false)}},
                                { title: 'Usar una fecha predefinida', checked: defaultDate !== 'hoy', onPress: () => { setDefaultDate(formatCurrentDate(date)); setShowDefaultDatePicker(true) }}
                            ]}
                            renderItem={({ item }) => (
                                <ListItem
                                    title={item.title}
                                    accessoryLeft={() => (
                                        <CheckBox
                                            status='success'
                                            checked={item.checked}
                                            onChange={item.onPress}
                                            style={{ marginTop: '1%' }}
                                        />
                                    )}
                                    onPress={item.onPress}
                                />
                            )}
                        />
                    {showDefaultDatePicker &&
                        <Datepicker
                            style={{paddingLeft:12}}
                            date={date}
                            onSelect={nextDate => {
                                setDate(nextDate)
                            }}
                            placeholder={dateFormat}
                            min={new Date(1900, 0, 1)}
                            max={new Date(2100, 11, 31)}
                            dateService={configureDDateService}
                            accessoryRight={<Icon name='calendar-outline' fill='#666666'/>}
                        />
                    }
                </View>
            }


            <Divider/>

            <View style={styles.field}>
                <TouchableOpacity style={styles.headerRow} onPress={() => setShowOptionalFeatures(!showOptionalFeatures)}>
                    <Text style={styles.subtitle}>Características opcionales</Text>
                    <Button
                    appearance='ghost'
                    accessoryLeft={props => <Icon name={showOptionalFeatures ? 'arrow-ios-upward-outline' : 'arrow-ios-downward-outline'} {...props} />}
                    onPress={() => setShowOptionalFeatures(!showOptionalFeatures)}
                    style={styles.toggleButton}
                    />
                </TouchableOpacity>
                {showOptionalFeatures && (
                    <View style={styles.submenu}>
                    <CheckBox
                        style={[styles.checkbox, { padding: '4%', alignSelf: 'flex-start' }]}
                        status='success'
                        checked={isNotEditable}
                        onChange={setIsNotEditable}
                    >
                        No editable
                    </CheckBox>
                    </View>
                )}
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: "1%",
        backgroundColor: '#ffffff',

    },
    title: {
        marginBottom: 16,
        fontWeight: 'bold',
        fontSize: 18,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    field: {
        marginTop: "4%",
        marginBottom: "4%",
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        padding: 0,
        borderRadius: 4,
    },
    buttonGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    formatButton: {
        padding: "3%",
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#cccccc',
        margin:0,
        backgroundColor: '#f9f9f9',
        width: '33%',
        alignItems: 'center',
    },
    selectedFormatButton: {
        backgroundColor: '#007BFF',
        borderColor: '#007BFF',
    },
    formatText: {
        fontSize: 12,
        color: '#333',
    },
    selectedFormatText: {
        color: '#fff',
    },
    saveButtonContainer: {
        marginTop: 20,
        alignSelf: 'center',
    },


    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Para que el botón esté a la derecha
        borderRadius: 4, // Bordes redondeados
    },
    saveButtonContainer: {
        marginTop: 20,
        alignSelf: 'center',
    },
    submenu: {
        marginLeft: "4%", // Mover los elementos levemente a la derecha
        marginBottom: "4%", // Mover los elementos levemente hacia abajo
        borderLeftWidth: 4, // Solo el borde izquierdo
        borderLeftColor: '#cccccc', // Color del borde izquierdo
    },
})

export default DateConstructor
