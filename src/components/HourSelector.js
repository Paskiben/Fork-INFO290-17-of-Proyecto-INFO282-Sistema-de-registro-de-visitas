import React, { useState } from 'react'
import { Button, Text, Layout, Icon } from '@ui-kitten/components'
import { Platform, StyleSheet } from 'react-native'
import { TimerPickerModal } from "react-native-timer-picker"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics" // for haptic feedback
import * as Sentry from '@sentry/react-native'

const resetIcon = props => <Icon name='sync-outline' {...props} />


/**
 * The setter for the optuinal features
 *
 * @param {options} OptionalTimeFeatures - options for the hour selector,
 * The options object can have the following properties:
 * @param {string} [options.title] - A string to display as the title.
 * @param {string} [options.defaulttime] - The initial string to show when selecting the hour.
 * @param {boolean} [options.disabled] - defines if the HourSelector field is enabled or disabled..
 * @param {boolean} [options.required=false] - Indicates whether the field is required.
 * @returns {OptionalTimeFeatures} - The Layout that displays the whole HourSelector.
 **/
export const OptionalTimeFeatures = options => {
    return {
        title: options.title,
        defaultTime: options.defaultTime ?? "00:00",
        disabled: options.disabled ?? false,
        required: options.required ?? false,
    }
}

export const IconSimpleUsageShowcase = () => (
    <Icon
        style={styles.icon}
        fill='#8F9BB3'
        name='star'
    />
)

/**
 * The logic and layout of the hour selector 
 * 
 * @param {string} value - define the current time
 * @param {Function} onChange - function used to update the current time.
 * @param {Object} OptionalTimeFeatures - options for the hour selector,
* @returns {Layout} - The Layout that displays the whole HourSelector.
 **/
export default function HourSelector({ onChange, optionalFeatures = {}, requiredFieldRef, refreshFieldRef }) {
    const [showPicker, setShowPicker] = useState(false)
    const { title, defaultTime, disabled, required } = optionalFeatures
    const [hour, setHour] = useState(defaultTime)
    const [isRequiredAlert, setIsRequiredAlert] = useState(null)
    onChange(defaultTime)



    const formatTime = ({ hours, minutes }) => `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`


    const setNowTime = () => {
        setHour(defaultTime)
        onChange(defaultTime)
        setIsRequiredAlert(false)
    }
    requiredFieldRef.current = () => {
        if (required) {
            setIsRequiredAlert(true)
        } else {
            setIsRequiredAlert(false)
        }
    }
    refreshFieldRef.current = () => {
        setHour(defaultTime)
        onChange(defaultTime)
    }
    return (
        <Layout style={styles.container}>

            <Layout style={styles.text}>
                <Text style={styles.text}>
                    {title}
                </Text>
            </Layout>
            <Layout style={styles.buttonContainer}>
                <Button disabled={disabled} status='success' onPress={() => setShowPicker(true)} appearance='outline' style={disabled ? styles.disabledHour : styles.hour} size='large'>{hour}</Button>
                {isRequiredAlert ?
                    <Layout size='small' style={styles.alert}>
                        <Icon status='danger' fill='#FF0000' name='alert-circle' style={styles.icon} />
                        <Text style={styles.alert} category="p2">
                            Por favor seleccione una hora
                        </Text>
                    </Layout>
                    :
                    <></>
                }
                {disabled ?
                    <></> :
                    <Button style={styles.button} accessoryLeft={resetIcon} onPress={() => setNowTime()}></Button>
                }
                <TimerPickerModal
                    visible={showPicker}
                    setIsVisible={setShowPicker}
                    onConfirm={(pickedDuration) => {
                        onChange(formatTime(pickedDuration))
                        setHour(formatTime(pickedDuration))
                        setShowPicker(false)
                    }}
                    modalTitle="Selecciona una hora"
                    onCancel={() => setShowPicker(false)}
                    closeOnOverlayPress
                    LinearGradient={LinearGradient}
                    Haptics={Haptics}
                    styles={{
                        theme: "light",
                    }}
                    modalProps={{
                        overlayOpacity: 0.2,
                    }}
                    hideSeconds={true}
                    agressivelyGetLatestDuretion={true}
                />
            </Layout>
        </Layout>
    )
}

// Define the styles of the different elements of the hour selector
const styles = StyleSheet.create({
    container: {
        padding: 10,
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#ffffff', // Color fondo suave
        borderWidth: 1,
        borderColor: '#00b7ae',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: Platform.OS == "ios" ? 1 : 10 },
        shadowOpacity: Platform.OS == "ios" ? 0.2 : 0.9,
        shadowRadius: Platform.OS == "ios" ? 2 : 2,
        elevation: 3,
        alignItems: 'flex-start'
    },
    titles: {
        fontWeight: 'bold',
        marginBottom: 10,
        margin: 2,
    },
    pickerContainer: {
        flexDirection: 'row',
        marginVertical: 20,
    },
    timeText: {
        fontSize: 20,
        paddingVertical: 10,
        marginHorizontal: 5,
    },
    ontainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    selectedTime: {
        marginVertical: 20,
        fontSize: 16,
    },
    closeButton: {
        marginTop: 20,
    },
    hour: {
        fontSize: 18,
        paddingVertical: 12,
        paddingHorizontal: 'auto',
        width: '80%'
    },
    disabledHour: {
        paddingVertical: 12,
        paddingHorizontal: 'auto',
        width: '100%'
    },
    button: {
        margin: 2,
        fontWeight: 'bold',
        fontSize: 10,
        width: '15%'

    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: '#ffffff',
    },
    icon: {
        width: 32,
        height: 32,
    },
    text: {
        fontSize: 17,
        marginHorizontal: '1%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'left',
    },
    alert: {
        flex: 1,
        margin: 1,
        color: '#ff0000',
        marginHorizontal: '1%',
        flexDirection: 'row',
        justifyContent: 'left',
        flexWrap: 'wrap',
    },
})
