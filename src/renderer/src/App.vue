<script setup>
import { ref, watch } from 'vue';

const selectedFile = ref(null);
const isConverting = ref(false);
const logMessages = ref([]);
const progress = ref(0);
const outputFormat = ref('mp4');

watch(
  () => outputFormat.value,
  (newValue) => {
    logMessages.value.push({ type: 'info', message: `Выбран формат: ${newValue}` });
  }
);

async function selectFile() {
  try {
    if (!window.electronAPI) {
      logMessages.value.push({ type: 'error', message: 'Electron API не доступен' });
      return;
    }

    const filePath = await window.electronAPI.selectFile();

    if (filePath) {
      selectedFile.value = filePath;
      progress.value = 0;
      logMessages.value = [];
      logMessages.value.push({ type: 'info', message: `Выбран файл: ${getFileName(filePath)}` });
    }
  } catch (error) {
    logMessages.value.push({ type: 'error', message: `Ошибка выбора файла: ${error}` });
  }
}

function getFileName(path) {
  return path ? path.split(/[\\/]/).pop() : '';
}

async function convertVideo() {
  if (!selectedFile.value || !window.electronAPI) {
    return;
  }
  
  isConverting.value = true;
  progress.value = 0;
  logMessages.value.push({ type: 'info', message: 'Процесс конвертации...' });
  
  try {
    const result = await window.electronAPI.convertVideo({
      inputPath: selectedFile.value,
      outputFormat: outputFormat.value
    });
    
    if (result && result.success) {
      progress.value = 100;
      logMessages.value.push({ type: 'success', message: 'Конвертация успешно завершена!' });
      logMessages.value.push({ type: 'info', message: `Конвертированный файл: ${result.outputPath}` });
    } else if (result) {
      logMessages.value.push({ type: 'error', message: `Ошибка конвертации: ${result.error}` });
    }
  } catch (error) {
    logMessages.value.push({ type: 'error', message: `Ошибка конвертации: ${error.message}` });
  } finally {
    isConverting.value = false;
  }
}
</script>

<template>
  <div>
    <h1>Простой видеоконвертер</h1>

    <div>
      <button @click="selectFile" :disabled="isConverting">
        {{ selectedFile ? "Файл выбран" : "Выбрать видеофайл" }}
      </button>

      <select v-model="outputFormat" :disabled="isConverting || !selectedFile">
        <option value="mp4">MP4</option>
        <option value="avi">AVI</option>
        <option value="mov">MOV</option>
        <option value="webm">WebM</option>
      </select>

      <button type="button" @click="convertVideo" :disabled="isConverting || !selectedFile">Конвертировать</button>
    </div>

    <div v-if="logMessages.length">
      <h3>Лог</h3>
      <div v-for="(message, index) in logMessages" :key="index">
        {{ message.message }}
      </div>
    </div>
  </div>
</template>
