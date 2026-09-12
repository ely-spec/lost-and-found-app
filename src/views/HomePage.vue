<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Lost and Found App</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="page-wrapper">
        <div class="hero-section">
          <div>
            <h1>Lost and Found Management</h1>
            <p>
              Record, manage, update, and monitor lost or found items using
              Firebase Firestore.
            </p>
          </div>

          <div class="stats-card">
            <span class="stats-label">Total Records</span>
            <strong>{{ items.length }}</strong>
          </div>
        </div>

        <div class="content-grid">
          <!-- FORM SECTION -->
          <div class="form-card">
            <div class="card-header">
              <div>
                <h2>{{ isEditing ? 'Edit Item' : 'Add New Item' }}</h2>
                <p>
                  {{
                    isEditing
                      ? 'Update the selected record.'
                      : 'Fill out the information below.'
                  }}
                </p>
              </div>
            </div>

            <form @submit.prevent="saveItem">
              <div class="form-group">
                <label>Item Name</label>
                <ion-input
                  v-model="form.itemName"
                  placeholder="Example: Black Wallet"
                  fill="outline"
                  required
                ></ion-input>
              </div>

              <div class="form-group">
                <label>Description</label>
                <ion-textarea
                  v-model="form.description"
                  placeholder="Describe the item..."
                  fill="outline"
                  :auto-grow="true"
                  required
                ></ion-textarea>
              </div>

              <div class="form-group">
                <label>Location Found / Lost</label>
                <ion-input
                  v-model="form.location"
                  placeholder="Example: Library"
                  fill="outline"
                  required
                ></ion-input>
              </div>

              <div class="two-column">
                <div class="form-group">
                  <label>Date</label>
                  <ion-input
                    v-model="form.date"
                    type="date"
                    fill="outline"
                    required
                  ></ion-input>
                </div>

                <div class="form-group">
                  <label>Type</label>
                  <ion-select
                    v-model="form.type"
                    fill="outline"
                    placeholder="Select type"
                  >
                    <ion-select-option value="Lost">
                      Lost
                    </ion-select-option>

                    <ion-select-option value="Found">
                      Found
                    </ion-select-option>
                  </ion-select>
                </div>
              </div>

              <div class="form-group">
                <label>Status</label>
                <ion-select
                  v-model="form.status"
                  fill="outline"
                  placeholder="Select status"
                >
                  <ion-select-option value="Unclaimed">
                    Unclaimed
                  </ion-select-option>

                  <ion-select-option value="Claimed">
                    Claimed
                  </ion-select-option>
                </ion-select>
              </div>

              <div class="button-row">
                <ion-button
                  expand="block"
                  type="submit"
                  :disabled="loading"
                >
                  {{ isEditing ? 'Update Item' : 'Add Item' }}
                </ion-button>

                <ion-button
                  v-if="isEditing"
                  expand="block"
                  fill="outline"
                  color="medium"
                  type="button"
                  @click="cancelEdit"
                >
                  Cancel Edit
                </ion-button>
              </div>
            </form>
          </div>

          <!-- RECORDS SECTION -->
          <div class="records-card">
            <div class="records-header">
              <div>
                <h2>Item Records</h2>
                <p>View and manage all saved records.</p>
              </div>

              <ion-button
                fill="outline"
                size="small"
                @click="loadItems"
              >
                Refresh
              </ion-button>
            </div>

            <div class="filter-row">
              <ion-searchbar
                v-model="searchText"
                placeholder="Search item or location..."
              ></ion-searchbar>

              <ion-select
                v-model="statusFilter"
                fill="outline"
                interface="popover"
              >
                <ion-select-option value="All">
                  All Status
                </ion-select-option>

                <ion-select-option value="Unclaimed">
                  Unclaimed
                </ion-select-option>

                <ion-select-option value="Claimed">
                  Claimed
                </ion-select-option>
              </ion-select>
            </div>

            <div v-if="loading" class="empty-state">
              <ion-spinner name="crescent"></ion-spinner>
              <p>Loading records...</p>
            </div>

            <div
              v-else-if="filteredItems.length === 0"
              class="empty-state"
            >
              <h3>No records found</h3>
              <p>
                Add a lost or found item using the form.
              </p>
            </div>

            <div v-else class="records-list">
              <div
                v-for="item in filteredItems"
                :key="item.id"
                class="record-item"
              >
                <div class="record-top">
                  <div>
                    <h3>{{ item.itemName }}</h3>

                    <div class="badge-row">
                      <span
                        class="badge"
                        :class="
                          item.type === 'Lost'
                            ? 'lost-badge'
                            : 'found-badge'
                        "
                      >
                        {{ item.type }}
                      </span>

                      <span
                        class="badge"
                        :class="
                          item.status === 'Claimed'
                            ? 'claimed-badge'
                            : 'unclaimed-badge'
                        "
                      >
                        {{ item.status }}
                      </span>
                    </div>
                  </div>

                  <span class="record-date">
                    {{ item.date }}
                  </span>
                </div>

                <p class="description">
                  {{ item.description }}
                </p>

                <div class="record-info">
                  <span>
                    <strong>Location:</strong>
                    {{ item.location }}
                  </span>
                </div>

                <div class="record-actions">
                  <ion-button
                    size="small"
                    fill="outline"
                    @click="editItem(item)"
                  >
                    Edit
                  </ion-button>

                  <ion-button
                    size="small"
                    color="danger"
                    fill="outline"
                    @click="deleteItemRecord(item.id)"
                  >
                    Delete
                  </ion-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ion-toast
        :is-open="toastOpen"
        :message="toastMessage"
        :duration="2000"
        @didDismiss="toastOpen = false"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSearchbar,
  IonToast,
  IonSpinner
} from '@ionic/vue';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

import { computed, onMounted, reactive, ref } from 'vue';

import { db } from '../firebase';

interface LostFoundItem {
  id: string;
  itemName: string;
  description: string;
  location: string;
  date: string;
  type: string;
  status: string;
}

const items = ref<LostFoundItem[]>([]);
const loading = ref(false);

const isEditing = ref(false);
const editingId = ref('');

const searchText = ref('');
const statusFilter = ref('All');

const toastOpen = ref(false);
const toastMessage = ref('');

const form = reactive({
  itemName: '',
  description: '',
  location: '',
  date: '',
  type: 'Lost',
  status: 'Unclaimed'
});

const showToast = (message: string) => {
  toastMessage.value = message;
  toastOpen.value = true;
};

const resetForm = () => {
  form.itemName = '';
  form.description = '';
  form.location = '';
  form.date = '';
  form.type = 'Lost';
  form.status = 'Unclaimed';

  isEditing.value = false;
  editingId.value = '';
};

const saveItem = async () => {
  if (
    !form.itemName.trim() ||
    !form.description.trim() ||
    !form.location.trim() ||
    !form.date
  ) {
    showToast('Please complete all required fields.');
    return;
  }

  try {
    loading.value = true;

    if (isEditing.value && editingId.value) {
      const itemRef = doc(db, 'items', editingId.value);

      await updateDoc(itemRef, {
        itemName: form.itemName.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        date: form.date,
        type: form.type,
        status: form.status
      });

      showToast('Item updated successfully.');
    } else {
      await addDoc(collection(db, 'items'), {
        itemName: form.itemName.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        date: form.date,
        type: form.type,
        status: form.status,
        createdAt: serverTimestamp()
      });

      showToast('Item added successfully.');
    }

    resetForm();
    await loadItems();
  } catch (error) {
    console.error('Error saving item:', error);
    showToast('Unable to save item.');
  } finally {
    loading.value = false;
  }
};

const loadItems = async () => {
  try {
    loading.value = true;

    const itemsQuery = query(
      collection(db, 'items'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(itemsQuery);

    items.value = snapshot.docs.map((document) => {
      const data = document.data();

      return {
        id: document.id,
        itemName: data.itemName ?? '',
        description: data.description ?? '',
        location: data.location ?? '',
        date: data.date ?? '',
        type: data.type ?? 'Lost',
        status: data.status ?? 'Unclaimed'
      };
    });
  } catch (error) {
    console.error('Error loading items:', error);

    try {
      const snapshot = await getDocs(collection(db, 'items'));

      items.value = snapshot.docs.map((document) => {
        const data = document.data();

        return {
          id: document.id,
          itemName: data.itemName ?? '',
          description: data.description ?? '',
          location: data.location ?? '',
          date: data.date ?? '',
          type: data.type ?? 'Lost',
          status: data.status ?? 'Unclaimed'
        };
      });
    } catch (secondError) {
      console.error('Fallback loading error:', secondError);
      showToast('Unable to load records.');
    }
  } finally {
    loading.value = false;
  }
};

const editItem = (item: LostFoundItem) => {
  form.itemName = item.itemName;
  form.description = item.description;
  form.location = item.location;
  form.date = item.date;
  form.type = item.type;
  form.status = item.status;

  editingId.value = item.id;
  isEditing.value = true;

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const cancelEdit = () => {
  resetForm();
};

const deleteItemRecord = async (id: string) => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this record?'
  );

  if (!confirmed) {
    return;
  }

  try {
    loading.value = true;

    await deleteDoc(doc(db, 'items', id));

    showToast('Item deleted successfully.');
    await loadItems();
  } catch (error) {
    console.error('Error deleting item:', error);
    showToast('Unable to delete item.');
  } finally {
    loading.value = false;
  }
};

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const search = searchText.value.toLowerCase().trim();

    const matchesSearch =
      item.itemName.toLowerCase().includes(search) ||
      item.location.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter.value === 'All' ||
      item.status === statusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

onMounted(() => {
  loadItems();
});
</script>

<style scoped>
ion-content {
  --background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 35%),
    linear-gradient(180deg, #0f172a 0%, #111827 45%, #0b1120 100%);
}

ion-toolbar {
  --background: rgba(15, 23, 42, 0.95);
  --color: #ffffff;
  --border-color: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

ion-title {
  font-weight: 800;
  letter-spacing: 0.3px;
}

.page-wrapper {
  width: min(1220px, calc(100% - 32px));
  margin: 0 auto;
  padding: 38px 0 70px;
}

.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 30px;
  padding: 30px;
  border-radius: 28px;
  background:
    linear-gradient(
      135deg,
      rgba(37, 99, 235, 0.95),
      rgba(79, 70, 229, 0.92)
    );
  box-shadow:
    0 22px 55px rgba(30, 64, 175, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  top: -120px;
  right: 120px;
}

.hero-section::after {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  bottom: -90px;
  right: -30px;
}

.hero-section > * {
  position: relative;
  z-index: 1;
}

.hero-section h1 {
  margin: 0 0 10px;
  font-size: clamp(30px, 5vw, 46px);
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -1px;
}

.hero-section p {
  margin: 0;
  max-width: 680px;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.7;
  font-size: 15px;
}

.stats-card {
  min-width: 165px;
  padding: 22px 26px;
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: white;
  text-align: center;
  backdrop-filter: blur(18px);
  box-shadow: 0 16px 35px rgba(15, 23, 42, 0.25);
}

.stats-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #cbd5e1;
}

.stats-card strong {
  font-size: 36px;
  font-weight: 900;
}

.content-grid {
  display: grid;
  grid-template-columns: 390px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.form-card,
.records-card {
  position: relative;
  background: rgba(17, 24, 39, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 24px;
  padding: 24px;
  box-shadow:
    0 18px 50px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
}

.form-card::before,
.records-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  border-radius: 24px 0 0 24px;
  background: linear-gradient(180deg, #3b82f6, #8b5cf6);
}

.card-header,
.records-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.card-header h2,
.records-header h2 {
  margin: 0 0 6px;
  color: #f8fafc;
  font-size: 24px;
  font-weight: 800;
}

.card-header p,
.records-header p {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #cbd5e1;
}

ion-input,
ion-textarea,
ion-select {
  --background: #0f172a;
  --color: #f8fafc;
  --placeholder-color: #64748b;
  --placeholder-opacity: 1;
  --border-color: #334155;
  --highlight-color-focused: #60a5fa;
  --highlight-color-valid: #60a5fa;
  --highlight-color-invalid: #f87171;
  --padding-start: 14px;
  --padding-end: 14px;
  border-radius: 12px;
}

ion-input::part(native),
ion-textarea::part(native) {
  color: #f8fafc !important;
}

ion-select::part(text) {
  color: #f8fafc !important;
}

ion-select::part(placeholder) {
  color: #64748b !important;
  opacity: 1;
}

ion-select::part(icon) {
  color: #94a3b8;
}

.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.button-row {
  display: grid;
  gap: 10px;
  margin-top: 22px;
}

ion-button {
  --border-radius: 12px;
  font-weight: 700;
  letter-spacing: 0.25px;
}

.button-row ion-button[type='submit'] {
  --background: linear-gradient(135deg, #2563eb, #7c3aed);
  --background-hover: linear-gradient(135deg, #1d4ed8, #6d28d9);
  --box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28);
  min-height: 46px;
}

.records-header ion-button {
  --color: #93c5fd;
  --border-color: rgba(147, 197, 253, 0.5);
}

.filter-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 200px;
  gap: 12px;
  align-items: center;
  margin-bottom: 22px;
}

ion-searchbar {
  --background: #0f172a;
  --color: #f8fafc;
  --placeholder-color: #64748b;
  --icon-color: #94a3b8;
  --clear-button-color: #94a3b8;
  --box-shadow: none;
  --border-radius: 12px;
  padding: 0;
}

.records-list {
  display: grid;
  gap: 16px;
}

.record-item {
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 18px;
  padding: 18px;
  background:
    linear-gradient(
      145deg,
      rgba(15, 23, 42, 0.96),
      rgba(30, 41, 59, 0.92)
    );
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.record-item:hover {
  transform: translateY(-3px);
  border-color: rgba(96, 165, 250, 0.4);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22);
}

.record-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.record-top h3 {
  margin: 0 0 10px;
  font-size: 20px;
  color: #f8fafc;
  font-weight: 800;
}

.record-date {
  white-space: nowrap;
  color: #94a3b8;
  font-size: 13px;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.lost-badge {
  background: rgba(239, 68, 68, 0.14);
  color: #fca5a5;
  border: 1px solid rgba(248, 113, 113, 0.2);
}

.found-badge {
  background: rgba(59, 130, 246, 0.14);
  color: #93c5fd;
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.claimed-badge {
  background: rgba(34, 197, 94, 0.14);
  color: #86efac;
  border: 1px solid rgba(74, 222, 128, 0.2);
}

.unclaimed-badge {
  background: rgba(245, 158, 11, 0.14);
  color: #fcd34d;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.description {
  margin: 16px 0;
  color: #cbd5e1;
  line-height: 1.65;
}

.record-info {
  color: #94a3b8;
  font-size: 14px;
}

.record-info strong {
  color: #e2e8f0;
}

.record-actions {
  display: flex;
  gap: 8px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #94a3b8;
}

.empty-state h3 {
  margin-bottom: 5px;
  color: #e2e8f0;
  font-size: 22px;
}

.empty-state p {
  margin: 0;
}

ion-spinner {
  color: #60a5fa;
  transform: scale(1.2);
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .form-card {
    order: 1;
  }

  .records-card {
    order: 2;
  }
}

@media (max-width: 650px) {
  .page-wrapper {
    width: min(100% - 18px, 1220px);
    padding-top: 16px;
  }

  .hero-section {
    flex-direction: column;
    align-items: stretch;
    padding: 22px;
    border-radius: 22px;
  }

  .stats-card {
    width: 100%;
  }

  .two-column,
  .filter-row {
    grid-template-columns: 1fr;
  }

  .form-card,
  .records-card {
    padding: 18px;
    border-radius: 18px;
  }

  .record-top {
    flex-direction: column;
  }

  .record-actions {
    flex-wrap: wrap;
  }
}
</style>