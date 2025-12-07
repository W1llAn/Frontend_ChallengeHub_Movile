import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View as RNView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors, { BorderRadius, Shadows, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FileUploadArea } from '@/components/UI/FileUploadArea';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useSubmissions } from '@/hooks/useSubmissions';
import { Challenge } from '@/types/api/challenge.type';
import { 
  SubmissionCreateDTO, 
  SubmissionFileCreateDTO,
  SubmissionUpdateDTO,
  SubmissionResponseDTO,
  FileRole,
} from '@/types/api/submission.type';
import { validateDateByFrequency } from '@/utils/submission.util';

interface SubmissionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (submission: SubmissionResponseDTO) => void;
  challenge: Challenge | null;
  userChallengeId: number | null;
  editingSubmission?: SubmissionResponseDTO | null; // Para modo edición
}

/**
 * Modal para registrar/editar avances en un reto
 * Permite seleccionar archivos (fotos o PDFs) según los requerimientos del reto
 * y crear/editar un submission con esos archivos
 * 
 * Modos:
 * - Crear: Nuevo submission completo (3 pasos: upload -> create -> addFile)
 * - Editar: Solo reemplazar el archivo de un submission existente
 */
export const SubmissionModal = ({
  visible,
  onClose,
  onSuccess,
  challenge,
  userChallengeId,
  editingSubmission,
}: SubmissionModalProps) => {
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[colorScheme];

  // Hooks para manejo de archivos y submissions
  const {
    selectedFile,
    uploading,
    uploadProgress,
    error: uploadError,
    clearError: clearUploadError,
    pickPhotoFromGallery,
    pickPdfDocument,
    removeFile,
    clearFiles,
    uploadFile,
  } = useFileUpload();

  const {
    creating,
    addingFile,
    updating,
    error: submissionError,
    createSubmission,
    addFileToSubmission,
    updateSubmission,
    clearError: clearSubmissionError,
  } = useSubmissions();

  // Estado local
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Limpiar errores cuando se abre/cierra el modal
  useEffect(() => {
    if (visible) {
      clearUploadError();
      clearSubmissionError();
    } else {
      clearFiles();
      setSelectedDate(new Date());
    }
  }, [visible]);

  /**
   * Valida que la fecha no sea en el futuro
   */
  const isDateValid = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date <= today;
  };

  /**
   * Maneja tanto la creación como la edición de submissions
   * - Crear: 3 pasos (upload -> create -> addFile)
   * - Editar: solo reemplaza el archivo existente
   */
  const handleSubmitSubmission = useCallback(async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Debes seleccionar un archivo');
      return;
    }

    // Si estamos editando, solo necesitamos subir el archivo y actualizar
    if (editingSubmission) {
      try {
        const validationType = challenge?.validationType || 'PHOTO';
        // Subir el nuevo archivo
        const uploadResponse = await uploadFile(selectedFile, validationType);
        let fileId = uploadResponse?.fileId;

        if (!fileId && fileId !== 0) {
          throw new Error('El servidor no devolvió un ID de archivo válido. Respuesta: ' + JSON.stringify(uploadResponse));
        }

        // Asegurar que fileId es un número
        if (typeof fileId !== 'number') {
          fileId = Number(fileId);
          if (isNaN(fileId)) {
            throw new Error('No se pudo convertir fileId a número válido');
          }
        }

        // Actualizar el submission con el nuevo fileId
        const updatePayload: SubmissionUpdateDTO = {
          type: validationType,
          fileId: fileId,
        };

        const updatedSubmission = await updateSubmission(editingSubmission.id, updatePayload);

        Alert.alert(
          'Éxito',
          'Tu avance ha sido actualizado',
          [
            {
              text: 'OK',
              onPress: () => {
                clearFiles();
                setSelectedDate(new Date());
                onClose();
                onSuccess?.(updatedSubmission);
              },
            },
          ]
        );
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Error al actualizar el submission';
        console.error('❌ Error en handleSubmitSubmission (edit):', errorMessage);
        Alert.alert('Error', errorMessage);
      }
      return;
    }

    // De lo contrario, estamos creando un nuevo submission
    if (!userChallengeId || !challenge) {
      Alert.alert('Error', 'Datos incompletos para crear el submission');
      return;
    }

    // Validar fecha según la frecuencia del reto
    const dateValidation = validateDateByFrequency(selectedDate, challenge.frequency);
    if (!dateValidation.valid) {
      Alert.alert('Error', dateValidation.error);
      return;
    }

    try {
      // PASO 1: Subir el archivo primero (obtener fileId del servidor)
      const validationType = challenge.validationType || 'PHOTO';
      const uploadResponse = await uploadFile(selectedFile, validationType);
      let fileId = uploadResponse?.fileId;

      // Validar y convertir fileId si es necesario
      if (!fileId && fileId !== 0) {
        throw new Error('El servidor no devolvió un ID de archivo válido (fileId). Respuesta: ' + JSON.stringify(uploadResponse));
      }

      // Asegurar que fileId es un número
      if (typeof fileId !== 'number') {
        fileId = Number(fileId);
        if (isNaN(fileId)) {
          throw new Error('No se pudo convertir fileId a número válido');
        }
      }

      // PASO 2: Crear el submission con userChallengeId y type
      const submissionPayload: SubmissionCreateDTO = {
        userChallengeId: Number(userChallengeId),
        type: validationType,
      };
      
      const submission = await createSubmission(submissionPayload);

      // PASO 3: Asociar el archivo al submission
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('📤 PASO 3: Asociando archivo a submission');
      console.log('═══════════════════════════════════════════════');
      
      // fileId es un número devuelto directamente por el servidor
      const filePayload: SubmissionFileCreateDTO = {
        fileId: fileId as number, // Ya es un número del backend
        role: 'EVIDENCE' as FileRole,
      };

      console.log('📋 Body a enviar:');
      console.log(JSON.stringify(filePayload, null, 2));
      console.log('   - submissionId (en URL):', submission.id, '(type:', typeof submission.id, ')');
      console.log('   - fileId:', filePayload.fileId, '(type:', typeof filePayload.fileId, ')');
      console.log('   - role:', filePayload.role, '(type:', typeof filePayload.role, ')');
      console.log('📍 URL: POST /submissions/' + submission.id + '/files');
      console.log('═══════════════════════════════════════════════');
      
      const fileResponse = await addFileToSubmission(submission.id, filePayload);
      
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('✅ Archivo asociado correctamente');
      console.log('═══════════════════════════════════════════════');
      console.log('   - fileId:', fileResponse.fileId);
      console.log('   - role:', fileResponse.role);
      console.log('═══════════════════════════════════════════════');
      console.log('');

      // Mostrar éxito
      Alert.alert(
        'Éxito',
        `Tu avance ha sido registrado${
          challenge.requireReview
            ? ' y está en revisión'
            : ' y aprobado automáticamente'
        }`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearFiles();
              setSelectedDate(new Date());
              onClose();
              onSuccess?.(submission);
            },
          },
        ]
      );
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al crear el submission';
      console.error('❌ Error en handleSubmitSubmission (create):', errorMessage);
      Alert.alert('Error', errorMessage);
    }
  }, [userChallengeId, challenge, selectedFile, selectedDate, editingSubmission, uploadFile, createSubmission, addFileToSubmission, updateSubmission, clearFiles, onClose, onSuccess]);

  const handleDateChange = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    
    // Validar fecha según la frecuencia del reto
    const dateValidation = validateDateByFrequency(newDate, challenge?.frequency);
    if (dateValidation.valid) {
      setSelectedDate(newDate);
    } else {
      Alert.alert('Error', dateValidation.error);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const error = uploadError || submissionError;
  const isLoading = uploading || creating || addingFile || updating;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.background, borderBottomColor: colors.border },
          ]}
        >
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Ionicons
              name="close"
              size={24}
              color={colors.text}
              style={{ opacity: isLoading ? 0.5 : 1 }}
            />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {editingSubmission ? 'Actualizar Avance' : 'Registrar Avance'}
          </Text>

          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor:
                  selectedFile && !isLoading
                    ? colors.primary
                    : colors.border,
              },
            ]}
            onPress={handleSubmitSubmission}
            disabled={!selectedFile || isLoading}
            activeOpacity={0.7}
          >
            {creating || updating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {editingSubmission ? 'Actualizar' : 'Enviar'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Challenge Info */}
          <View style={[styles.challengeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.challengeIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="document-text-outline" size={32} color={colors.primary} />
            </View>
            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
              <Text style={[styles.challengeTitle, { color: colors.text }]}>
                {challenge?.title || 'Reto'}
              </Text>
              <Text style={[styles.challengeDesc, { color: colors.textSecondary }]}>
                Registra tu avance en este reto
              </Text>
            </View>
          </View>

          {/* Date Selector */}
          <View style={[styles.section, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Fecha del Período
            </Text>
            <View
              style={[
                styles.dateSelectorContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleDateChange(-1)}
                disabled={isLoading}
                activeOpacity={0.6}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={colors.primary}
                  style={{ opacity: isLoading ? 0.5 : 1 }}
                />
              </TouchableOpacity>

              <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'transparent' }}>
                <Text style={[styles.selectedDate, { color: colors.text }]}>
                  {formatDate(selectedDate)}
                </Text>
                <Text style={[styles.dateInfo, { color: colors.textTertiary }]}>
                  {selectedDate.getFullYear()}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDateChange(1)}
                disabled={isLoading}
                activeOpacity={0.6}
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={colors.primary}
                  style={{ opacity: isLoading ? 0.5 : 1 }}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* File Upload Area */}
          <View style={[styles.section, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Subir Evidencia
            </Text>
            <FileUploadArea
              validationType={challenge?.validationType || 'PHOTO'}
              selectedFile={selectedFile}
              uploading={uploading}
              uploadProgress={uploadProgress}
              error={error}
              onPickPhoto={() => pickPhotoFromGallery(challenge?.validationType || 'PHOTO')}
              onPickPdf={() => pickPdfDocument(challenge?.validationType || 'PDF')}
              onRemoveFile={removeFile}
              colors={colors}
            />
          </View>

          {/* Review Status Info */}
          {challenge?.requireReview && (
            <View
              style={[
                styles.reviewInfo,
                { backgroundColor: colors.primary + '15', borderColor: colors.primary },
              ]}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.reviewInfoText, { color: colors.primary }]}>
                Este reto requiere revisión manual. Tu envío será revisado por el creador del reto.
              </Text>
            </View>
          )}

          {!challenge?.requireReview && (
            <View
              style={[
                styles.reviewInfo,
                { backgroundColor: colors.success + '15', borderColor: colors.success },
              ]}
            >
              <Ionicons name="flash-outline" size={20} color={colors.success} />
              <Text style={[styles.reviewInfoText, { color: colors.success }]}>
                Este reto tiene aprobación automática. Tu avance será procesado inmediatamente.
              </Text>
            </View>
          )}

          {/* Tips */}
          <View style={[styles.tipsContainer, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>
              💡 Consejos
            </Text>
            <View style={[styles.tipItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.tipBullet, { color: colors.primary }]}>•</Text>
              <Text style={[styles.tipText, { color: colors.text }]}>
                Asegúrate de que los archivos sean legibles y muestren claramente tu avance
              </Text>
            </View>
            <View style={[styles.tipItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.tipBullet, { color: colors.primary }]}>•</Text>
              <Text style={[styles.tipText, { color: colors.text }]}>
                Los archivos no deben exceder 10 MB cada uno
              </Text>
            </View>
            <View style={[styles.tipItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.tipBullet, { color: colors.primary }]}>•</Text>
              <Text style={[styles.tipText, { color: colors.text }]}>
                Puedes subir múltiples archivos para el mismo período
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  submitButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
    ...Shadows.small,
  },
  challengeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  challengeDesc: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  dateSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.lg,
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  reviewInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  reviewInfoText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  tipsContainer: {
    gap: Spacing.sm,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  tipBullet: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  tipText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
});
