import React, { useEffect, useState } from 'react'
import { Platform, Dimensions, StyleSheet, View, Text, FlatList, Alert, TouchableOpacity, Image, ScrollView } from 'react-native'
import { Menu, MenuItem, Modal, Card, TopNavigation, TopNavigationAction, Layout, Button, Icon, RangeCalendar, NativeDateService, Input, CheckBox } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import shareTypes from '../commonStructures/shareTypes'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getDatabaseInstance } from '../database/database'
import { useSQLiteContext } from 'expo-sqlite'
import { ScrollViewIndicator} from '@fanchenbao/react-native-scroll-indicator'
 
const { height } = Dimensions.get('window')
const { width } = Dimensions.get('window')

const highlightColors = ['lightgreen', 'orange', 'lightcoral', 'purple', 'cyan', 'magenta', 'deepskyblue', 'mediumseagreen', 'tomato', 'gold']
const highlightColorsSoft = ['#ccffcc', '#ffcc99', '#ffcccc', '#e0b3ff', '#ccffff', '#ffccff', '#b3e0ff', '#ccffcc', '#ffb3b3', '#ffeb99']
const getHighlightColor = index => highlightColors[Math.abs(index) % highlightColors.length]
const getHighlightColorSoft = index => highlightColorsSoft[Math.abs(index) % highlightColorsSoft.length]

const hash = function(s) {
    return s.split("").reduce(function(a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
    }, 0);
}

const SavedForms = () => {
    const navigation = useNavigation()
    const [baseForms, setBaseForms] = useState([])
    const [forms, setForms] = useState([])
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedForm, setSelectedForm] = useState(null)
    const [isSelectionMode, setIsSelectionMode] = useState(false) // Modo de selección
    const [selectedForms, setSelectedForms] = useState([]) // Formularios seleccionados
    const [filter, selectedFilter] = useState(null)
    const [index, setSelectedIndex] = useState(null)
    const [range, setRange] = useState({})
    const [isRangeMode, setIsRangeMode] = useState(false)
    const [isLastsMode, setIsLastsMode] = useState(false)
    const [isFilterVisible, setFilterVisible] = useState(false)
    const [lasts, setLasts] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [expandedTypes, setExpandedTypes] = useState({})
    const [visible, setVisible] = useState(false)
    const [rangeModal, setRangeModal] = useState(false)

    const database = getDatabaseInstance(useSQLiteContext())

    const optionBar = () => (
        <Layout style={styles.iconContainer}>
            <TopNavigationAction icon={SelectionIcon} onPress={toggleSelectionMode} />
            <TopNavigationAction icon={filterIcon} onPress={() => setFilterVisible(true)} />
        </Layout>
    )

    const configuredDateService = new NativeDateService('es', {
        startDayOfWeek: 1,
        format: 'DD/MM/YYYY'
    })

    const handleRange = () => {
        const startInt = range.startDate ? range.startDate.getTime() : null
        const endInt = range.endDate ? range.endDate.getTime() : null
        if (startInt) {
            endInt ? setForms(baseForms.filter((data) => {
                return data.fecha >= startInt && data.fecha <= endInt + 86399999
            })) : setForms(baseForms.filter((data) => {
                return data.fecha >= startInt
            }))
        }
    }

    const filters = [
        { value: "Fecha ↓", func: () => forms.sort((a, b) => b.fecha - a.fecha) },
        { value: "Fecha ↑", func: () => forms.sort((a, b) => a.fecha - b.fecha) },
        { value: "Rango", func: () => (setIsRangeMode(true), setRangeModal(true)) },
        { value: "Ultimos", func: () => setIsLastsMode(true) }
    ]

    const fetchSavedForms = async () => {
        try {
            const savedForms = database.getAllAnswers() || []
            setBaseForms(savedForms)
            setForms(savedForms)
        } catch (error) {
            Sentry.captureException('Error :', error)
        }
    }


    const exportForm = form => {
        const filePath = `${FileSystem.cacheDirectory}respuestasFormularios.json`
        const copy = form.map(({ id, ...form }) => form)

        const objectStringified = form.length === 1 ? JSON.stringify({
            share_content_type: shareTypes.SINGLE_ANSWER,
            content: copy
        }) : JSON.stringify({
            share_content_type: shareTypes.MULTIPLE_ANSWERS,
            content: copy
        })


        // Intentar compartir usando un archivo temporal
        FileSystem.writeAsStringAsync(filePath, objectStringified).then(
            () => Sharing.shareAsync(filePath, {
                dialogTitle: 'Compartir JSON como archivo',
                mimeType: 'application/json',
                UTI: 'public.json'
            })
            // Si se compartio correctamente
        ).then(
            response => {
                if (response === Sharing.sharedAction)
                    Alert.alert('¡Compartido!', 'El archivo JSON se compartió correctamente')
            }
            // Si no se pudo compartir 
        ).catch(error => {
            Sentry.captureException('Error al compartir:', error);
            Alert.alert('Error', 'Hubo un problema al intentar compartir el archivo')
            // Borrar el archivo temporal
        }).finally(
            async () => {
                try {
                    const fileInfo = await FileSystem.getInfoAsync(filePath)
                    if (fileInfo.exists) await FileSystem.deleteAsync(filePath)
                } catch (deleteError) {
                    Sentry.captureException('Error al eliminar el archivo:', deleteError)
                }
            }
        )
    }

    const deleteSelectedForms = async () => {
        try {
            selectedForms.forEach(answerDate => {
                database.deleteAnswers(answerDate)
            })
            setForms(database.getAllAnswers())
            setSelectedForms([]) // Resetear formularios seleccionados
            setIsSelectionMode(false) // Salir del modo de selección

            Alert.alert('Éxito', 'Formularios eliminados')
            fetchSavedForms()
        } catch (error) {
            Sentry.captureException('Error :', error)
            Alert.alert('Error', 'No se pudo eliminar los formularios seleccionados')
        }
    }

    const openModal = (form) => {
        setSelectedForm(form)
        setModalVisible(true)
    }

    const closeModal = () => {
        setModalVisible(false)
        setSelectedForm(null)
        setSelectedForms([])
    }

    useEffect(() => {
        fetchSavedForms()
    }, [])

    const BackIcon = (props) => (
        <Icon
            name='arrow-ios-back-outline'
            style={styles.backIcon}
            fill='#fff'
            {...props}
        />
    )

    const deleteIcon = props => <Icon name='trash' {...props} />
    const shareIcon = props => <Icon name='share' {...props} />
    const filterIcon = props => <Icon name='funnel-outline' fill="#fff" {...props} />
    const BackAction = () => <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
    const SelectionIcon = props => <Icon fill='#fff' name={isSelectionMode ? 'checkmark-square' : 'checkmark-square'} style={styles.backIcon} {...props} />
    const ClearSelectionIcon = props => <Icon name='close-circle-outline' fill='#fff' {...props} />; // Icono para limpiar selección
    const SelectAllIcon = props => <Icon name='checkmark-circle-outline' fill='#fff' {...props} />; // Icono para seleccionar todo
    const closeIcon = props => (<Icon {...props} name='close-outline' fill="#F32013" style={{width: 30, height: 30}} />)

    const selectAll = () => setSelectedForms(forms.map(form => form.fecha))
    const deselectAll = () => setSelectedForms([])

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedForms([]) // Resetear selección al activar/desactivar modo
    }

    const handleSelection = id => {
        if (isSelectionMode) {
            setSelectedForms(prev =>
                prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
            )
        } else {
            setSelectedForms([id])
            openModal(forms.find(form => form.fecha === id))
        }
    }

    const handleFilter = (index) => {
        const selectedItem = filters[index.row]
        setSelectedIndex(index)
        selectedFilter(selectedItem.value)
        const newForms = baseForms
        selectedItem.func(newForms)
        setForms(newForms)
    }
    const toggleSelectByFormName = formName => {
        setIsSelectionMode(true)
        const currentSelectedForms = new Set(selectedForms)
        const formsToToggle = baseForms.filter(form => form.plantilla === formName)

        let allSelected = true
        for (const form of formsToToggle)
            if (!currentSelectedForms.has(form.fecha)) {
                allSelected = false
                break
            }
        if (allSelected)
            formsToToggle.forEach(form => currentSelectedForms.delete(form.fecha))
        else
            formsToToggle.forEach(form => currentSelectedForms.add(form.fecha))

        setSelectedForms([...currentSelectedForms])
    }
    const renderTitle = () => (
        <View style={styles.titleContainer}>
            <Text style={styles.topNavigationText}>Formularios Guardados</Text>
        </View>
    )
    const groupedForms = forms.reduce((acc, form) => {
        if (!acc[form.plantilla])
            acc[form.plantilla] = []
        acc[form.plantilla].push(form)
        return acc
    }, {})

    const renderFormItem = ({ item, highlightColor }) => {
        
        const dateString = new Date(item.fecha).toLocaleString(undefined, {
            hour12: false, weekday:'long', year:'numeric', month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit', second: '2-digit'})


        return (
            <TouchableOpacity
                style={[
                    styles.containerBox,
                    {borderLeftColor: highlightColor},
                    selectedForms.includes(item.fecha) && styles.selectedItem,
                ]}
                onPress={() => handleSelection(item.fecha)}
                onLongPress={toggleSelectionMode}
            >

                {!isSelectionMode || <CheckBox checked={selectedForms.includes(item.fecha)} onChange={() => handleSelection(item.fecha)}></CheckBox>}
                <Text style={styles.formTitle}>{dateString}</Text>
                {isSelectionMode ||
                    <Button style={styles.button} onPress={() => exportForm([item])} accessoryLeft={shareIcon} />
                }
            </TouchableOpacity>
        )
    }

    const toggleExpand = (type) => {
        setExpandedTypes(prevState => ({
            ...prevState,
            [type]: !prevState[type]
        }))
    }

    const renderTypeItem = ({ item }) => {

        const hashedItem = hash(item)
        const highlightColor = getHighlightColor(hashedItem)
        const highlightColorSoft = getHighlightColorSoft(hashedItem)
        
        return (<View>
            <TouchableOpacity
            style={{ backgroundColor: highlightColorSoft, borderRadius: 10, marginTop: 10, borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 5 }}
            onLongPress={toggleSelectionMode}
            onPress={() => toggleExpand(item)}
            >
                {isSelectionMode && (
                    <CheckBox
                        checked={groupedForms[item].every(form => selectedForms.includes(form.fecha))}
                        onChange={() => toggleSelectByFormName(item)}
                        style={{ padding: 8 }}
                    />
                )}
                <Text style={styles.formType}>{item}</Text>
                <Icon name='arrow-ios-downward-outline' style={styles.icon} fill='#000' />
            </TouchableOpacity>
            {expandedTypes[item] && (
                <FlatList
                    data={isLastsMode && lasts ? groupedForms[item].reverse().slice(0,lasts) : groupedForms[item].reverse()}
                    renderItem={item => renderFormItem({item: item.item, highlightColor: highlightColor})}
                    keyExtractor={form => form.fecha.toString()}
                />
            )}
        </View>
    )}

    const renderDeleteModal = () => {
        const selectedGroup = forms.reduce((acc, form) => {
            if (selectedForms.includes(form.fecha)) {
                if (!acc[form.plantilla])
                    acc[form.plantilla] = []
                acc[form.plantilla].push(form)
                return acc
            }
            return acc
        }, {})


        return (                    
        <Layout style={styles.container}>
            <Text>¿Está seguro/a de que desea eliminar los siguientes formularios?</Text>

            <Layout style={styles.responseContainer}>
                <ScrollView style={{ maxHeight: height * 0.5 }}>
                    {Object.keys(selectedGroup).map(key => {
                        return (
                            <Layout style={styles.containerRespuestas}>
                                <Text style={styles.key}>{key}</Text>
                                {selectedGroup[key].map((item) => 
                                    {const dateString = new Date(item.fecha).toLocaleString({}, {
                                        hour12: false, weekday:'long', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second: '2-digit'})
                                    return (
                                        <Layout style={styles.containerBox}>
                                            <Text>{dateString}</Text>
                                        </Layout>
                                    )})}
                            </Layout>
                        )
                    })}
                </ScrollView>
            </Layout>
            <Layout style={styles.buttonContainer}>
                <Button
                    accessoryLeft={BackIcon}
                    style={{flex: 1, borderRadius: 0, borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}
                    onPress={() => confirmDelete[1] ? (setConfirmDelete([false, false]), setModalVisible(true)) : setConfirmDelete([false, false])}>
                    <Text>
                        Cancelar
                    </Text>
                </Button>
                <Button accessoryLeft={deleteIcon}
                    status='danger'
                    style={{flex: 1, borderRadius: 0, borderTopRightRadius: 10, borderBottomRightRadius: 10}}
                    onPress={() => {
                        deleteSelectedForms()
                        setConfirmDelete([false, false])
                    }}>
                    <Text>
                        Eliminar
                    </Text>
                </Button>

            </Layout>
        </Layout>
        )
    }

    return (
        <>
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient colors={['#2dafb9', '#17b2b6', '#00b4b2', '#00b7ad', '#00b9a7', '#00bba0', '#00bd98', '#00bf8f', '#00c185', '#00c27b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <TopNavigation
                        title={renderTitle}
                        style={styles.topNavigation}
                        accessoryLeft={BackAction}
                        accessoryRight={optionBar}
                        alignment='center'
                    />
                </LinearGradient>
            </SafeAreaView>

            <View style={styles.container}>
                <Layout style={{ alignItems: 'flex-end', backgroundColor: '#f2f2f2' }}>
                    {isFilterVisible && (
                        <Modal
                            visible={isFilterVisible}
                            onBackdropPress={() => setFilterVisible(false)}
                            style={styles.filterWindowModal}
                            animationType='slide'
                        >
                            <Card disabled={true} style={{ width: width, borderRadius: 10 }}>
                                <Menu>
                                    {filters.map((item, index) => (
                                        item && item.value ? (
                                            <MenuItem
                                                key={item.value}
                                                title={item.value}
                                                onPress={() => {
                                                    setFilterVisible(false)
                                                    handleFilter({ row: index })
                                                }} 
                                            />
                                        ) : null
                                    ))}
                                </Menu>
                                <Button onPress={() => setFilterVisible(false)}>
                                    <Text>
                                        Cerrar
                                    </Text>
                                </Button>
                            </Card>
                        </Modal>
                    )}

                    {isRangeMode?
                        <Layout style={{flexDirection: 'row', alignItems: 'center', maxWidth: '90%', justifyContent: 'center', backgroundColor:'#f3f3f3', paddingEnd: '10%'}}>
                            <TouchableOpacity onPress={() => setRangeModal(true)} style={styles.buttonDateStyle}>
                                <Layout >
                                    <Text style={styles.textDateStyle}>
                                        {'Inicio: ' + (range.startDate ? configuredDateService.format(range.startDate) : '-') + ', Final: ' + (range.endDate ? configuredDateService.format(range.endDate) : '-')}
                                    </Text>
                                </Layout>
                            </TouchableOpacity>
                            <Button appearance='ghost' accessoryRight={closeIcon} onPress={() => {setIsRangeMode(false) 
                                setRange({}) 
                                setForms(baseForms)}}/>
                        </Layout> : <></>
                    }
                    {isLastsMode ? 
                    <Layout style={{flexDirection: 'row', alignItems: 'center', maxWidth: '90%', justifyContent: 'center', backgroundColor:'#f3f3f3', paddingEnd: '10%'}}>
                        <Input placeholder='¿Cuantas respuestas desea?' value={lasts} onChangeText={nextValue => {setLasts(nextValue)}} style={{width : '100%'}} keyboardType='numeric' />
                        <Button appearance='ghost' accessoryRight={closeIcon} onPress={() => (setIsLastsMode(false), setLasts(null))}/>
                    </Layout>: <></>}
                </Layout>
                {lasts != 0 ? <FlatList
                    data={Object.keys(groupedForms)}
                    renderItem={renderTypeItem}
                    keyExtractor={item => item.toString()}
                    contentContainerStyle={styles.listContainer}
                /> : <></>}
                <Modal visible={rangeModal} backdropStyle={styles.backdrop}>
                    <Layout style={styles.containerCalendar}>
                        <RangeCalendar range={range} onSelect={nextrange => setRange(nextrange)} />
                        <View style={styles.buttonRangeContainer}>
                            <Button style={{ marginRight: "3%" }} status='info' onPress={() => (setRangeModal(false))}>
                                <Text>Volver</Text>
                            </Button>
                            <Button style={{ marginLeft: "3%" }}
                                onPress={() => {
                                    setRangeModal(false)
                                    setIsRangeMode(true)
                                    handleRange()
                                }}>
                                <Text>
                                    Confirmar
                                </Text>
                            </Button>
                        </View>
                    </Layout>
                </Modal>
                <Modal visible={confirmDelete[0]} backdropStyle={styles.backdrop}>
                    {renderDeleteModal()}
                </Modal>


                {isSelectionMode && (
                    <Layout style={styles.buttonContainer}>
                        <Button
                        status='danger'
                        style={styles.deleteButton}
                        onPress={() => setConfirmDelete([true, false])}
                        accessoryLeft={deleteIcon}
                        disabled={selectedForms.length === 0}
                        >
                            <Text style={styles.buttonText}>Eliminar</Text>
                        </Button>
                        <Button
                        status='info'
                        style={styles.shareButton}
                        accessoryLeft={shareIcon}
                        onPress={() => exportForm(forms.filter(form => selectedForms.includes(form.fecha)))}
                        disabled={selectedForms.length === 0}
                        >
                            <Text style={styles.buttonText}>Compartir</Text>
                        </Button>
                    </Layout>
                    )}
                
                {isSelectionMode && (
                    <View style={styles.buttonContainer}>
                        <Button
                        onPress={deselectAll}
                        accessoryLeft={ClearSelectionIcon}
                        style={styles.selectionButton}
                        disabled={selectedForms.length === 0}
                        >
                            <Text style={styles.buttonText}>Limpiar selección</Text>
                        </Button>
                        <Button
                        status='warning'
                        onPress={selectAll}
                        style={styles.selectAllButton}
                        accessoryLeft={SelectAllIcon}
                        disabled={selectedForms.length === forms.length}
                        >
                            <Text style={styles.buttonText}>Seleccionar todo</Text>
                        </Button>
                    </View>
                )}


                <Modal
                    visible={modalVisible}
                    transparent={true}
                    onRequestClose={closeModal}
                    backdropStyle={styles.backdrop}
                >
                    <Layout style={styles.modalContainer}>
                        <Card style={styles.modalCard} disabled={true} >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between',  alignItems: 'center', maxWidth: '100%'}}>
                                    <Text style={styles.modalTitle}>{selectedForm?.plantilla}</Text>
                                    <Button appearance='ghost' accessoryRight={closeIcon} onPress={closeModal} style={{alignContent:'center'}}/>
                                </View>
                                <View style={{maxHeight: height * 0.5}}>
                                <ScrollViewIndicator>
                                {selectedForm && Object.entries(selectedForm.data).map(([key, value]) => (
                                    <Layout style={styles.containerRespuestas}>
                                        <Text style={styles.key} key={key}>{`${key}`}</Text>
                                        <ScrollView style={{ maxHeight: 200 }}>
                                            {
                                                value[0] === 'camara' ?
                                                    <Image source={{ uri: `data:image/jpeg;base64,${value[1]}` }} style={{ width: 300, height: 300 }} resizeMode='center' /> :
                                                    <Text style={styles.value}>{`${value[1]}`}</Text>
                                            }
                                        </ScrollView>
                                    </Layout>
                                ))}
                                </ScrollViewIndicator>
                                </View>
                                <Layout style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10}}>
                                <Button accessoryLeft={deleteIcon} status='danger' onPress={() => { setConfirmDelete([true, true]); setModalVisible(false) }}>
                                    <Text>
                                        Eliminar
                                    </Text>
                                </Button>
                                <Button accessoryLeft={shareIcon} status='info' onPress={() => exportForm([selectedForm])}>
                                    <Text>
                                        Compartir
                                    </Text>
                                </Button>
                                </Layout>
                        </Card>
                    </Layout>
                </Modal>
            </View>
        </>
    )
}


const styles = StyleSheet.create({
    inputUltimos: {
        marginBottom: "3%",
        backgroundColor: '#ededed',
        color: '#7D7D7D',
        borderColor: '#D1D1D1',
    },
    buttonDateStyle: {
        backgroundColor: '#f8f7fd',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#D1D1D1',
        alignItems: 'center',
        alignSelf: 'start',
        height: 40,
        width: '100%'
    },
    textDateStyle: {
        color: '#7D7D7D',
        backgroundColor: '#f8f7fd',
        fontWeight: '500',
        textAlign: 'center',
    },
    filterWindowModal: {
        margin: 0,
        height: height,
        justifyContent: 'flex-end',
        zIndex: 10,
    },
    safeArea: {
        backgroundColor: '#00baa4'
    },
    iconContainer: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'center',
    },
    container: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        borderColor: '#00b7ae',
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
    },
    topNavigationText: {
        marginRight: Platform.OS == "ios" ? 50 : 50,
        fontSize: Platform.OS == "ios" ? 22 : 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    key: {
        fontWeight: 'bold',
        fontSize: 12,
        color: "#9e9e9e"
    },
    value: {
        fontSize: 18,
        color: "#9e9e9e",
    },
    listContainer: {
        paddingBottom: 100,
    },
    button: {
        marginVertical: 0,
        marginRight: 0,
        paddingVertical: 5,
        paddingHorizontal: 5,
        fontWeight: 'bold',
        fontSize: 10,
    },
    formTitle: {
        fontSize: 18,
        width: '80%',
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    containerBox: {
        padding: 12,
        marginLeft: 25,
        marginRight: 5,
        borderLeftColor: '#00ff00',
        backgroundColor: '#ffffff',
        borderWidth: 0,
        borderTopWidth: 1,
        borderLeftWidth: 5,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    containerCalendar: {
        width: '100%',
        padding: 10,
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#9beba5',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: "10%" },
        shadowOpacity: 0.9,
        shadowRadius: 2,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'column',
    },
    containerRespuestas: {
        alignItems: 'flex-start',
        flexDirection: 'column',
        marginBottom: 10,
        paddingVertical: 10,
        paddingHorizontal: '1%',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    selectedItem: {
        backgroundColor: '#BBDEFB',
        borderColor: '#79b2fc',
    },
    deleteButton: {
        width: '35%',
        marginRight: '3%'
    },
    closeButton: {
        width: '18%',
        marginLeft: '3%'
    },
    shareButton: {
        width: '35%',
        marginLeft: '3%'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        zIndex: 10
    },
    modalCard: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: '100%',
        borderRadius: 10,
        minWidth: '90%'
    },
    modalTitle: {
        fontSize: 20,
        alignContent: 'center',
        fontWeight: 'bold',
        width: '90%',
    },
    topNavigation: {
        backgroundColor: 'transparent',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#333',
    },
    backIcon: {
        width: 25,
        height: 25,
    },
    buttonContainer: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'center',
    },
    formType: {
        fontSize: 23,
        fontWeight: 'bold',
        width: '90%',
        marginVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    buttonRangeContainer: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'center',
    },
    icon: {
        width: 24,
        height: 24,
    },
    deleteButton: {
        flex: 1,
        borderRadius: 0, // Botones cuadrados
        borderTopLeftRadius: 20
    },
    shareButton: {
        flex: 1,
        borderRadius: 0, // Botones cuadrados
        borderTopRightRadius: 20
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    selectionButton: {
        flex: 1,
        borderRadius: 0, // Botones cuadrados
        borderBottomLeftRadius: 20
    },
    selectAllButton: {
        flex: 1,
        borderRadius: 0, // Botones cuadrados
        borderWidth: 0,
        borderBottomRightRadius: 20
    },
    responseContainer: {
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
        padding: 10,
        paddingLeft: 20,
        marginBottom: 10,
        marginTop: 10,
    },
})

export default SavedForms
