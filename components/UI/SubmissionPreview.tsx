import React, { memo } from 'react';
import {
  StyleSheet,
  View as RNView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors, { BorderRadius, Shadows, Spacing } from '@/constants/Colors';
import { SubmissionFileResponseDTO } from '@/types/api/submission.type';
import { transformDocumentUrl } from '@/utils/image-url.util';

interface SubmissionPreviewProps {
  files: SubmissionFileResponseDTO[];
  colors: typeof Colors.light;
  onDownload?: (fileUrl: string, fileName: string) => void;
}

const { width } = Dimensions.get('window');

/**
 * Componente para previsualizar archivos de un submission
 * Muestra imágenes inline y PDFs con iconos descargables
 */
export const SubmissionPreview = memo(
  ({ files, colors, onDownload }: SubmissionPreviewProps) => {
    if (!files || files.length === 0) {
      return null;
    }

    const file = files[0]; // Solo un archivo por submission
    const fileData = file.file;
    // Usar la URL devuelta directamente por el backend y transformarla con la IP correcta
    const fileUrl = transformDocumentUrl(fileData?.url) || '';
    const fileName = fileData?.filename || 'archivo';
    const fileSize = fileData?.sizeBytes || 0;
    const contentType = fileData?.contentType || '';
    const isPdf = contentType.includes('pdf');
    const isImage = contentType.startsWith('image/');

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.title, { color: colors.text }]}>Archivo Cargado</Text>

        {isImage ? (
          // Image Preview
          <Image
            source={{ uri: fileUrl }}
            style={[
              styles.imagePreview,
              { borderColor: colors.border },
            ]}
            resizeMode="cover"
          />
        ) : isPdf ? (
          // PDF Preview
          <View
            style={[
              styles.pdfPreview,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="document" size={48} color={colors.primary} />
            <Text style={[styles.pdfFileName, { color: colors.text }]}>
              {fileName}
            </Text>
            <Text style={[styles.pdfFileSize, { color: colors.textSecondary }]}>
              {formatFileSize(fileSize)}
            </Text>
          </View>
        ) : null}

        {/* File Info */}
        <View style={[styles.fileInfo, { backgroundColor: 'transparent' }]}>
          <View style={[styles.infoRow, { backgroundColor: 'transparent' }]}>
            <Ionicons name="document-text" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Archivo:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {fileName}
            </Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: 'transparent' }]}>
            <Ionicons name="save" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Tamaño:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {formatFileSize(fileSize)}
            </Text>
          </View>

          <View style={[styles.infoRow, { backgroundColor: 'transparent' }]}>
            <Ionicons name="link" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Tipo:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {contentType}
            </Text>
          </View>
        </View>

        {/* Download Button */}
        {onDownload && fileUrl && (
          <TouchableOpacity
            style={[styles.downloadButton, { backgroundColor: colors.primary }]}
            onPress={() => onDownload(fileUrl, fileName)}
          >
            <Ionicons name="download" size={18} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Descargar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

SubmissionPreview.displayName = 'SubmissionPreview';

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  pdfPreview: {
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pdfFileName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  pdfFileSize: {
    fontSize: 12,
    fontWeight: '500',
  },
  fileInfo: {
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 60,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
