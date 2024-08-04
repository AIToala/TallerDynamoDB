<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AWS from 'aws-sdk'
import axios from 'axios'

const ApiURL = ''
const s3 = new AWS.S3({
  accessKeyId: '',
  secretAccessKey: '',
  sessionToken: '',
  region: 'us-east-1'
})

const api = axios.create({
  baseURL: ApiURL
})

interface Evento {
  id_inscripcion: string
  event_name: string
  image_url: string
}

const getEvents = async () => {
  try {
    await api
      .get(ApiURL + '?TableName=InscripcionEvento')
      .then((res) => {
        console.log(res.data.Items)
        events.value = res.data.Items
      })
      .catch((err) => console.error(err))
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  getEvents()
})

const event_name = ref('')
const event_file: any = ref(null)
const events = ref<Evento[]>([])

const handleSubmit = async () => {
  if (!event_name.value || !event_file.value) {
    alert('Por favor complete todos los campos')
    return
  }
  const params = {
    Bucket: 'taller1-gallery-toala',
    Key: event_name.value,
    Body: event_file.value,
    ContentType: 'JSON',
    ACL: 'public-read'
  }
  try {
    await s3
      .upload(params)
      .promise()
      .then((res) => {
        console.log('NO HUBO ERROR', res)
        api
          .post(ApiURL, {
            TableName: 'InscripcionEvento',
            Item: {
              id_inscripcion: res.Key,
              event_name: res.Key,
              image_url: res.Location
            }
          })
          .then(() => {
            getEvents()
            event_name.value = ''
            event_file.value = null
          })
          .catch((err) => console.error(err))
      })
      .catch((err) => console.error('OCURRIO UN ERROR', err))
  } catch (error) {
    console.error(error)
    alert('Error al crear el evento')
  }
}
</script>

<template>
  <div>
    <div>
      <h1>CREADOR DE EVENTOS MASIVOS</h1>
      <b-form-group label="Nombre del evento" label-class="font-weight-bold text-primary">
        <b-form-input
          id="event_name"
          v-model="event_name"
          :formatter="(value: string) => value.toUpperCase()"
        />
      </b-form-group>
      <b-form-group label="Imagen del evento" label-class="font-weight-bold text-primary">
        <b-form-file
          id="imagen"
          v-model="event_file"
          single
          accept=".jpg,.png,.jpeg"
          no-drop
          placeholder="Seleccione una imagen"
        />
      </b-form-group>
      <b-button variant="primary" block size="lg" @click="handleSubmit"> Crear evento </b-button>
    </div>
    <div class="mt-5">
      <h1>EVENTOS CREADOS</h1>
      <div class="gallery">
        <div v-for="event in events" :key="event.id_inscripcion" class="event-card">
          <img
            :src="event.image_url"
            alt="Event Image"
            width="350px"
            height="350px"
            class="event-image"
          />
          <p class="event-name">{{ event.event_name }}</p>
        </div>
        <div v-if="events.length === 0">
          <p>No hay eventos creados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.event-image {
  object-fit: cover;
  border-radius: 5px;
}
.event-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 10px;
}
</style>
