import React, { memo } from 'react';
import {
  View as RNView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors, { BorderRadius, Shadows, Spacing } from '@/constants/Colors';
import { ValidationType } from '@/types/api/submission.type';

interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
}

interface FileUploadAreaProps {
  validationType: ValidationType;
  selectedFile: SelectedFile | null;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
  onPickPhoto: () => Promise<void>;
  onPickPdf: () => Promise<void>;
  onRemoveFile: () => void;
  colors: typeof Colors.light;
}

/**
 * Componente para seleccionar un archivo PDF o imagen
 * Solo permite un archivo a la vez (se selecciona antes de subir)
 */
export const FileUploadArea = memo(
  ({
    validationType,
    selectedFile,
    uploading,
    uploadProgress,
    error,
    onPickPhoto,
    onPickPdf,
    onRemoveFile,
    colors,
  }: FileUploadAreaProps) => {
    const isPdfType = validationType === 'PDF';
    const isPhotoType = validationType === 'PHOTO';

    const handlePickFile = () => {
      if (isPdfType) {
        onPickPdf();
      } else if (isPhotoType) {
        onPickPhoto();
      }
    };

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        {/* Tipo de archivo esperado */}
        <View style={[styles.typeInfo, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={[styles.typeIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons
              name={isPdfType ? 'document' : 'image'}
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Text style={[styles.typeLabel, { color: colors.textTertiary }]}>
              TIPO REQUERIDO
            </Text>
            <Text style={[styles.typeValue, { color: colors.text }]}>
              {isPdfType ? 'PDF' : 'Foto'}
            </Text>
          </View>
        </View>

        {/* Error */}
        {error && (
          <View style={[styles.errorContainer, { borderColor: colors.error, backgroundColor: colors.error + '15' }]}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Botón para seleccionar archivo */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            {
              backgroundColor: !selectedFile ? colors.primary : colors.border,
              opacity: uploading ? 0.6 : 1,
            },
          ]}
          onPress={handlePickFile}
          disabled={uploading || selectedFile !== null}
          activeOpacity={0.8}
        >
          {uploading ? (
            <RNView style={styles.uploadingContent}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.uploadingText}>{uploadProgress}%</Text>
            </RNView>
          ) : (
            <RNView style={styles.uploadButtonContent}>
              <Ionicons
                name={isPdfType ? 'document-attach' : 'image-outline'}
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.uploadButtonText}>
                {selectedFile
                  ? isPdfType ? 'PDF Seleccionado' : 'Foto Seleccionada'
                  : isPdfType ? 'Seleccionar PDF' : 'Seleccionar Foto'}
              </Text>
            </RNView>
          )}
        </TouchableOpacity>

        {/* Archivo seleccionado */}
        {selectedFile && (
          <View style={[styles.fileCard, { backgroundColor: colors.surface, borderColor: colors.border }, Shadows.small]}>
            {/* Preview */}
            <View style={[styles.filePreview, { backgroundColor: colors.backgroundSecondary }]}>
              {isPhotoType && selectedFile.mimeType.startsWith('image/') ? (
                <Image
                  source={{ uri: selectedFile.uri }}
                  style={styles.fileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.fileIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons
                    name="document"
                    size={40}
                    color={colors.primary}
                  />
                </View>
              )}

              {/* Botón eliminar */}
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: colors.error }]}
                onPress={onRemoveFile}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={[styles.fileInfo, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={2}>
                {selectedFile.name}
              </Text>
              <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                {formatFileSize(selectedFile.size)}
              </Text>
            </View>
          </View>
        )}

        {/* Info adicional */}
        <View style={[styles.infoContainer, { backgroundColor: colors.surface + '50' }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {isPdfType
              ? 'Selecciona un PDF que contenga toda la evidencia del avance.'
              : 'Selecciona una foto que muestre claramente tu avance.'}
          </Text>
        </View>
      </View>
    );
  }
);

FileUploadArea.displayName = 'FileUploadArea';

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  typeValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  uploadButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonContent: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  uploadingContent: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  fileCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  filePreview: {
    width: '100%',
    height: 200,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileImage: {
    width: '100%',
    height: '100%',
  },
  fileIcon: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    padding: Spacing.md,
    gap: 4,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileSize: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
