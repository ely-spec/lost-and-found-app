<template>
  <ion-page>
    <ion-header class="app-header">
      <ion-toolbar>
        <ion-title>
          <div class="brand-title">
            <span class="brand-icon">⌁</span>
            <span>Lost & Found</span>
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="app-container">

        <!-- =========================
             HOME SCREEN
        ========================== -->
        <section v-if="activeTab === 'home'" class="screen home-screen">
          <div class="welcome-row">
            <div>
              <p class="eyebrow">CAMPUS LOST & FOUND</p>
              <h1>Find it. Report it.<br />Reunite it.</h1>
              <p class="welcome-text">
                Keep track of lost and found items in one simple place.
              </p>
            </div>

            <div class="welcome-mark">
              <span>⌕</span>
            </div>
          </div>

          <!-- HERO -->
          <div class="hero-card">
            <div class="hero-content">
              <span class="hero-label">LOST SOMETHING?</span>
              <h2>Help it find its way home.</h2>
              <p>
                Report lost or found items and keep every record organized.
              </p>

              <button class="hero-button" @click="openAddScreen">
                <span>＋</span>
                Report an Item
              </button>
            </div>

            <div class="hero-decoration hero-circle-one"></div>
            <div class="hero-decoration hero-circle-two"></div>
          </div>

          <!-- STATS -->
          <div class="section-heading">
            <div>
              <h2>Overview</h2>
              <p>Your current item records</p>
            </div>

            <button class="text-button" @click="loadItems">
              Refresh
            </button>
          </div>

          <div class="stats-grid">
            <div class="stat-box total-stat">
              <div class="stat-icon">▣</div>
              <div>
                <strong>{{ items.length }}</strong>
                <span>Total Items</span>
              </div>
            </div>

            <div class="stat-box lost-stat">
              <div class="stat-icon">!</div>
              <div>
                <strong>{{ lostCount }}</strong>
                <span>Lost</span>
              </div>
            </div>

            <div class="stat-box found-stat">
              <div class="stat-icon">⌕</div>
              <div>
                <strong>{{ foundCount }}</strong>
                <span>Found</span>
              </div>
            </div>

            <div class="stat-box claimed-stat">
              <div class="stat-icon">✓</div>
              <div>
                <strong>{{ claimedCount }}</strong>
                <span>Claimed</span>
              </div>
            </div>
          </div>

          <!-- RECENT -->
          <div class="section-heading recent-heading">
            <div>
              <h2>Recent Items</h2>
              <p>Latest reports from your records</p>
            </div>

            <button class="text-button" @click="goToRecords">
              See All
            </button>
          </div>

          <div v-if="loading" class="home-loading">
            <ion-spinner name="crescent"></ion-spinner>
            <span>Loading items...</span>
          </div>

          <div v-else-if="recentItems.length === 0" class="empty-home">
            <div class="empty-icon">⌕</div>
            <h3>No items yet</h3>
            <p>Your recently reported items will appear here.</p>

            <button class="secondary-action" @click="openAddScreen">
              Report First Item
            </button>
          </div>

          <div v-else class="recent-list">
            <div
              v-for="item in recentItems"
              :key="item.id"
              class="recent-card"
              @click="viewRecord(item)"
            >
              <div
                class="recent-symbol"
                :class="item.type === 'Lost' ? 'lost-symbol' : 'found-symbol'"
              >
                {{ item.type === 'Lost' ? '!' : '✓' }}
              </div>

              <div class="recent-info">
                <h3>{{ item.itemName }}</h3>

                <div class="mini-badges">
                  <span
                    class="badge"
                    :class="item.type === 'Lost' ? 'lost-badge' : 'found-badge'"
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

                <p>⌖ {{ item.location }}</p>
              </div>

              <span class="chevron">›</span>
            </div>
          </div>
        </section>

        <!-- =========================
             ADD / EDIT SCREEN
        ========================== -->
        <section v-if="activeTab === 'add'" class="screen">
          <div class="screen-title">
            <button
              v-if="isEditing"
              class="back-button"
              @click="cancelEdit"
            >
              ‹
            </button>

            <div>
              <p class="eyebrow">
                {{ isEditing ? 'UPDATE RECORD' : 'NEW REPORT' }}
              </p>

              <h1>
                {{ isEditing ? 'Edit Item' : 'Report an Item' }}
              </h1>

              <p>
                {{
                  isEditing
                    ? 'Update the information for this item.'
                    : 'Provide the details of the lost or found item.'
                }}
              </p>
            </div>
          </div>

          <div class="form-card">
            <form @submit.prevent="saveItem">
              <div class="form-group">
                <label>
                  Item Name
                  <span>*</span>
                </label>

                <ion-input
                  v-model="form.itemName"
                  placeholder="Example: Black Wallet"
                  fill="outline"
                  required
                ></ion-input>
              </div>

              <div class="form-group">
                <label>
                  Description
                  <span>*</span>
                </label>

                <ion-textarea
                  v-model="form.description"
                  placeholder="Describe the item in detail..."
                  fill="outline"
                  :auto-grow="true"
                  :rows="4"
                  required
                ></ion-textarea>
              </div>

              <div class="form-group">
                <label>
                  Location Found / Lost
                  <span>*</span>
                </label>

                <ion-input
                  v-model="form.location"
                  placeholder="Example: School Library"
                  fill="outline"
                  required
                ></ion-input>
              </div>

              <div class="form-group">
                <label>
                  Date
                  <span>*</span>
                </label>

                <ion-input
                  v-model="form.date"
                  type="date"
                  fill="outline"
                  required
                ></ion-input>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Type</label>

                  <ion-select
                    v-model="form.type"
                    fill="outline"
                    interface="popover"
                  >
                    <ion-select-option value="Lost">
                      Lost
                    </ion-select-option>

                    <ion-select-option value="Found">
                      Found
                    </ion-select-option>
                  </ion-select>
                </div>

                <div class="form-group">
                  <label>Status</label>

                  <ion-select
                    v-model="form.status"
                    fill="outline"
                    interface="popover"
                  >
                    <ion-select-option value="Unclaimed">
                      Unclaimed
                    </ion-select-option>

                    <ion-select-option value="Claimed">
                      Claimed
                    </ion-select-option>
                  </ion-select>
                </div>
              </div>

              <button
                class="save-button"
                type="submit"
                :disabled="loading"
              >
                <ion-spinner
                  v-if="loading"
                  name="crescent"
                ></ion-spinner>

                <template v-else>
                  <span>{{ isEditing ? '✓' : '＋' }}</span>
                  {{ isEditing ? 'Update Item' : 'Save Item' }}
                </template>
              </button>

              <button
                v-if="isEditing"
                class="cancel-button"
                type="button"
                @click="cancelEdit"
              >
                Cancel Editing
              </button>
            </form>
          </div>
        </section>

        <!-- =========================
             RECORDS SCREEN
        ========================== -->
        <section v-if="activeTab === 'records'" class="screen">
          <div class="records-title">
            <div>
              <p class="eyebrow">MANAGE ITEMS</p>
              <h1>Item Records</h1>
              <p>Search, filter, update, or remove saved items.</p>
            </div>

            <button
              class="refresh-icon-button"
              @click="loadItems"
              aria-label="Refresh records"
            >
              ↻
            </button>
          </div>

          <div class="records-tools">
            <ion-searchbar
              v-model="searchText"
              placeholder="Search item or location..."
            ></ion-searchbar>

            <div class="filter-tabs">
              <button
                :class="{ active: recordFilter === 'All' }"
                @click="recordFilter = 'All'"
              >
                All
              </button>

              <button
                :class="{ active: recordFilter === 'Lost' }"
                @click="recordFilter = 'Lost'"
              >
                Lost
              </button>

              <button
                :class="{ active: recordFilter === 'Found' }"
                @click="recordFilter = 'Found'"
              >
                Found
              </button>

              <button
                :class="{ active: recordFilter === 'Claimed' }"
                @click="recordFilter = 'Claimed'"
              >
                Claimed
              </button>
            </div>
          </div>

          <div v-if="loading" class="empty-state">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Loading records...</p>
          </div>

          <div
            v-else-if="filteredItems.length === 0"
            class="empty-state"
          >
            <div class="empty-icon">⌕</div>
            <h3>No records found</h3>
            <p>Try another search or report a new item.</p>

            <button class="secondary-action" @click="openAddScreen">
              ＋ Report Item
            </button>
          </div>

          <div v-else class="records-list">
            <article
              v-for="item in filteredItems"
              :key="item.id"
              class="record-card"
            >
              <div class="record-main">
                <div
                  class="record-symbol"
                  :class="
                    item.type === 'Lost'
                      ? 'lost-record-symbol'
                      : 'found-record-symbol'
                  "
                >
                  {{ item.type === 'Lost' ? '!' : '✓' }}
                </div>

                <div class="record-content">
                  <div class="record-heading">
                    <h3>{{ item.itemName }}</h3>
                    <span class="date">{{ formatDate(item.date) }}</span>
                  </div>

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

                  <p class="record-description">
                    {{ item.description }}
                  </p>

                  <div class="record-location">
                    <span>⌖</span>
                    <span>{{ item.location }}</span>
                  </div>
                </div>
              </div>

              <div class="record-actions">
                <button
                  v-if="item.status === 'Unclaimed'"
                  class="claim-button"
                  @click="markAsClaimed(item)"
                >
                  ✓ Mark Claimed
                </button>

                <button
                  v-else
                  class="unclaim-button"
                  @click="markAsUnclaimed(item)"
                >
                  ↶ Mark Unclaimed
                </button>

                <button
                  class="edit-button"
                  @click="editItem(item)"
                >
                  Edit
                </button>

                <button
                  class="delete-button"
                  @click="deleteItemRecord(item.id)"
                >
                  Delete
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>

      <!-- =========================
           BOTTOM NAVIGATION
      ========================== -->
      <nav class="bottom-navigation">
        <button
          class="nav-item"
          :class="{ active: activeTab === 'home' }"
          @click="changeTab('home')"
        >
          <span class="nav-icon">⌂</span>
          <span>Home</span>
        </button>

        <button
          class="nav-add"
          :class="{ active: activeTab === 'add' }"
          @click="openAddScreen"
          aria-label="Add Item"
        >
          <span>＋</span>
        </button>

        <button
          class="nav-item"
          :class="{ active: activeTab === 'records' }"
          @click="changeTab('records')"
        >
          <span class="nav-icon">▤</span>
          <span>Records</span>
        </button>
      </nav>

      <ion-toast
        :is-open="toastOpen"
        :message="toastMessage"
        :duration="2000"
        position="top"
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

import {
  computed,
  onMounted,
  reactive,
  ref
} from 'vue';

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

type TabName = 'home' | 'add' | 'records';

const activeTab = ref<TabName>('home');

const items = ref<LostFoundItem[]>([]);
const loading = ref(false);

const isEditing = ref(false);
const editingId = ref('');

const searchText = ref('');
const recordFilter = ref('All');

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

const scrollToTop = () => {
  const content = document.querySelector('ion-content');

  if (content) {
    (content as HTMLIonContentElement).scrollToTop(250);
  }
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

const changeTab = (tab: TabName) => {
  if (tab !== 'add' && isEditing.value) {
    resetForm();
  }

  activeTab.value = tab;

  setTimeout(() => {
    scrollToTop();
  }, 50);
};

const openAddScreen = () => {
  if (!isEditing.value) {
    resetForm();
  }

  activeTab.value = 'add';

  setTimeout(() => {
    scrollToTop();
  }, 50);
};

const goToRecords = () => {
  activeTab.value = 'records';

  setTimeout(() => {
    scrollToTop();
  }, 50);
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

    activeTab.value = 'records';

    setTimeout(() => {
      scrollToTop();
    }, 50);
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
    console.error('Error loading ordered items:', error);

    try {
      const snapshot = await getDocs(
        collection(db, 'items')
      );

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
      console.error(
        'Fallback loading error:',
        secondError
      );

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
  activeTab.value = 'add';

  setTimeout(() => {
    scrollToTop();
  }, 50);
};

const cancelEdit = () => {
  resetForm();
  activeTab.value = 'records';

  setTimeout(() => {
    scrollToTop();
  }, 50);
};

const deleteItemRecord = async (id: string) => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this record?'
  );

  if (!confirmed) return;

  try {
    loading.value = true;

    await deleteDoc(doc(db, 'items', id));

    items.value = items.value.filter(
      (item) => item.id !== id
    );

    showToast('Item deleted successfully.');
  } catch (error) {
    console.error('Error deleting item:', error);
    showToast('Unable to delete item.');
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (
  item: LostFoundItem,
  status: 'Claimed' | 'Unclaimed'
) => {
  try {
    await updateDoc(
      doc(db, 'items', item.id),
      {
        status
      }
    );

    const targetItem = items.value.find(
      (record) => record.id === item.id
    );

    if (targetItem) {
      targetItem.status = status;
    }

    showToast(
      status === 'Claimed'
        ? 'Item marked as claimed.'
        : 'Item marked as unclaimed.'
    );
  } catch (error) {
    console.error(
      'Error updating status:',
      error
    );

    showToast('Unable to update item status.');
  }
};

const markAsClaimed = (
  item: LostFoundItem
) => {
  updateStatus(item, 'Claimed');
};

const markAsUnclaimed = (
  item: LostFoundItem
) => {
  updateStatus(item, 'Unclaimed');
};

const viewRecord = (
  item: LostFoundItem
) => {
  searchText.value = item.itemName;
  recordFilter.value = 'All';
  activeTab.value = 'records';

  setTimeout(() => {
    scrollToTop();
  }, 50);
};

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const search =
      searchText.value.toLowerCase().trim();

    const matchesSearch =
      item.itemName
        .toLowerCase()
        .includes(search) ||
      item.location
        .toLowerCase()
        .includes(search) ||
      item.description
        .toLowerCase()
        .includes(search);

    let matchesFilter = true;

    if (recordFilter.value === 'Lost') {
      matchesFilter = item.type === 'Lost';
    }

    if (recordFilter.value === 'Found') {
      matchesFilter = item.type === 'Found';
    }

    if (recordFilter.value === 'Claimed') {
      matchesFilter =
        item.status === 'Claimed';
    }

    return matchesSearch && matchesFilter;
  });
});

const recentItems = computed(() => {
  return items.value.slice(0, 3);
});

const lostCount = computed(() => {
  return items.value.filter(
    (item) => item.type === 'Lost'
  ).length;
});

const foundCount = computed(() => {
  return items.value.filter(
    (item) => item.type === 'Found'
  ).length;
});

const claimedCount = computed(() => {
  return items.value.filter(
    (item) => item.status === 'Claimed'
  ).length;
});

const formatDate = (dateValue: string) => {
  if (!dateValue) return 'No date';

  const date = new Date(
    `${dateValue}T00:00:00`
  );

  return date.toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }
  );
};

onMounted(() => {
  loadItems();
});
</script>

<style scoped>
/* ==================================
   GLOBAL
================================== */

ion-content {
  --background: #07111f;
}

ion-toolbar {
  --background: rgba(7, 17, 31, 0.96);
  --color: #ffffff;
  --border-color: rgba(148, 163, 184, 0.1);
  min-height: 62px;
}

ion-title {
  padding-inline: 20px;
}

.brand-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 19px;
  font-weight: 900;
  letter-spacing: -0.3px;
}

.brand-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    #2563eb,
    #7c3aed
  );
  font-size: 22px;
}

.app-container {
  width: min(
    1100px,
    calc(100% - 30px)
  );
  margin: 0 auto;
  padding:
    30px
    0
    calc(120px + env(safe-area-inset-bottom));
}

.screen {
  animation: screenEnter 0.2s ease;
}

@keyframes screenEnter {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.eyebrow {
  margin: 0 0 7px !important;
  color: #60a5fa !important;
  font-size: 11px !important;
  font-weight: 900;
  letter-spacing: 1.4px;
}

/* ==================================
   HOME
================================== */

.welcome-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.welcome-row h1 {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(
    30px,
    5vw,
    48px
  );
  line-height: 1.08;
  letter-spacing: -1.4px;
  font-weight: 900;
}

.welcome-text {
  max-width: 520px;
  margin: 12px 0 0;
  color: #94a3b8;
  line-height: 1.6;
}

.welcome-mark {
  flex: 0 0 auto;
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  border: 1px solid rgba(
    96,
    165,
    250,
    0.25
  );
  border-radius: 24px;
  background: rgba(
    37,
    99,
    235,
    0.12
  );
  color: #60a5fa;
  font-size: 36px;
}

.hero-card {
  position: relative;
  overflow: hidden;
  padding: 30px;
  border-radius: 28px;
  background:
    linear-gradient(
      135deg,
      #1264f5 0%,
      #3155e7 50%,
      #7038ed 100%
    );
  box-shadow:
    0 22px 55px
    rgba(37, 99, 235, 0.22);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 610px;
}

.hero-label {
  display: inline-block;
  margin-bottom: 10px;
  color: rgba(
    255,
    255,
    255,
    0.7
  );
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1.4px;
}

.hero-card h2 {
  margin: 0;
  color: #ffffff;
  font-size: clamp(
    27px,
    4vw,
    40px
  );
  font-weight: 900;
  letter-spacing: -1px;
}

.hero-card p {
  max-width: 520px;
  margin: 10px 0 22px;
  color: rgba(
    255,
    255,
    255,
    0.8
  );
  line-height: 1.6;
}

.hero-button,
.save-button,
.secondary-action {
  border: 0;
  cursor: pointer;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 47px;
  padding: 0 20px;
  border-radius: 14px;
  background: #ffffff;
  color: #1d4ed8;
  font-weight: 900;
  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.18);
}

.hero-button span {
  font-size: 21px;
}

.hero-decoration {
  position: absolute;
  border-radius: 50%;
  background: rgba(
    255,
    255,
    255,
    0.08
  );
}

.hero-circle-one {
  width: 250px;
  height: 250px;
  top: -120px;
  right: 60px;
}

.hero-circle-two {
  width: 190px;
  height: 190px;
  right: -70px;
  bottom: -90px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin: 28px 2px 15px;
}

.section-heading h2 {
  margin: 0 0 4px;
  color: #f8fafc;
  font-size: 20px;
  font-weight: 900;
}

.section-heading p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.text-button {
  border: 0;
  background: transparent;
  color: #60a5fa;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 13px;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 100px;
  padding: 17px;
  border: 1px solid rgba(
    148,
    163,
    184,
    0.13
  );
  border-radius: 20px;
  background: #0d192a;
}

.stat-icon {
  display: grid;
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 14px;
  font-size: 20px;
  font-weight: 900;
}

.stat-box strong {
  display: block;
  color: #f8fafc;
  font-size: 25px;
  font-weight: 900;
}

.stat-box span {
  color: #94a3b8;
  font-size: 12px;
}

.total-stat .stat-icon {
  background: rgba(
    37,
    99,
    235,
    0.17
  );
  color: #60a5fa;
}

.lost-stat .stat-icon {
  background: rgba(
    239,
    68,
    68,
    0.14
  );
  color: #fb7185;
}

.found-stat .stat-icon {
  background: rgba(
    20,
    184,
    166,
    0.14
  );
  color: #2dd4bf;
}

.claimed-stat .stat-icon {
  background: rgba(
    34,
    197,
    94,
    0.14
  );
  color: #4ade80;
}

.recent-heading {
  margin-top: 30px;
}

.recent-list {
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
  gap: 13px;
}

.recent-card {
  display: grid;
  grid-template-columns:
    50px 1fr auto;
  align-items: center;
  gap: 13px;
  min-width: 0;
  padding: 16px;
  border: 1px solid rgba(
    148,
    163,
    184,
    0.13
  );
  border-radius: 19px;
  background: #0d192a;
  cursor: pointer;
  transition: 0.2s ease;
}

.recent-card:hover {
  transform: translateY(-2px);
  border-color: rgba(
    96,
    165,
    250,
    0.35
  );
}

.recent-symbol {
  display: grid;
  width: 50px;
  height: 50px;
  place-items: center;
  border-radius: 15px;
  font-size: 20px;
  font-weight: 900;
}

.lost-symbol {
  background: rgba(
    239,
    68,
    68,
    0.13
  );
  color: #fb7185;
}

.found-symbol {
  background: rgba(
    16,
    185,
    129,
    0.13
  );
  color: #34d399;
}

.recent-info {
  min-width: 0;
}

.recent-info h3 {
  overflow: hidden;
  margin: 0 0 7px;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-info p {
  overflow: hidden;
  margin: 8px 0 0;
  color: #94a3b8;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-badges,
.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chevron {
  color: #64748b;
  font-size: 26px;
}

.home-loading,
.empty-home,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  padding: 25px;
  text-align: center;
  border: 1px dashed rgba(
    148,
    163,
    184,
    0.18
  );
  border-radius: 20px;
  background: rgba(
    13,
    25,
    42,
    0.6
  );
  color: #94a3b8;
}

.home-loading {
  gap: 12px;
}

.empty-icon {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  margin-bottom: 12px;
  border-radius: 18px;
  background: rgba(
    37,
    99,
    235,
    0.13
  );
  color: #60a5fa;
  font-size: 29px;
}

.empty-home h3,
.empty-state h3 {
  margin: 0 0 6px;
  color: #e2e8f0;
}

.empty-home p,
.empty-state p {
  margin: 0 0 16px;
  color: #64748b;
}

/* ==================================
   ADD / EDIT
================================== */

.screen-title,
.records-title {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 22px;
}

.screen-title h1,
.records-title h1 {
  margin: 0 0 6px;
  color: #f8fafc;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.7px;
}

.screen-title p:not(.eyebrow),
.records-title p:not(.eyebrow) {
  margin: 0;
  color: #94a3b8;
  line-height: 1.5;
  font-size: 14px;
}

.back-button {
  display: grid;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgba(
    148,
    163,
    184,
    0.16
  );
  border-radius: 13px;
  background: #0d192a;
  color: #ffffff;
  font-size: 28px;
  cursor: pointer;
}

.form-card {
  width: min(650px, 100%);
  margin: 0 auto;
  padding: 25px;
  border: 1px solid rgba(
    148,
    163,
    184,
    0.14
  );
  border-radius: 24px;
  background: #0d192a;
  box-shadow:
    0 20px 50px
    rgba(0, 0, 0, 0.18);
}

.form-group {
  margin-bottom: 19px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 800;
}

.form-group label span {
  color: #60a5fa;
}

.form-row {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 13px;
}

ion-input,
ion-textarea,
ion-select {
  --background: #091525;
  --color: #f8fafc;
  --placeholder-color: #52647d;
  --placeholder-opacity: 1;
  --border-color: #293a52;
  --highlight-color-focused: #3b82f6;
  --highlight-color-valid: #3b82f6;
  --highlight-color-invalid: #fb7185;
  --padding-start: 15px;
  --padding-end: 15px;
  border-radius: 13px;
}

ion-input::part(native),
ion-textarea::part(native) {
  color: #f8fafc !important;
}

ion-select::part(text) {
  color: #f8fafc !important;
}

ion-select::part(icon) {
  color: #94a3b8;
}

.save-button {
  display: flex;
  width: 100%;
  min-height: 50px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    #2563eb,
    #4f46e5
  );
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
  box-shadow:
    0 12px 28px
    rgba(37, 99, 235, 0.25);
}

.save-button:disabled {
  opacity: 0.65;
}

.cancel-button {
  width: 100%;
  min-height: 46px;
  margin-top: 10px;
  border: 1px solid rgba(
    148,
    163,
    184,
    0.18
  );
  border-radius: 14px;
  background: transparent;
  color: #94a3b8;
  font-weight: 800;
  cursor: pointer;
}

/* ==================================
   RECORDS
================================== */

.records-title {
  justify-content: space-between;
}

.refresh-icon-button {
  display: grid;
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid rgba(
    96,
    165,
    250,
    0.22
  );
  border-radius: 14px;
  background: #0d192a;
  color: #60a5fa;
  font-size: 22px;
  cursor: pointer;
}

.records-tools {
  margin-bottom: 20px;
}

ion-searchbar {
  --background: #0d192a;
  --color: #f8fafc;
  --placeholder-color: #52647d;
  --icon-color: #94a3b8;
  --clear-button-color: #94a3b8;
  --box-shadow: none;
  --border-radius: 14px;
  padding: 0;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tabs button {
  flex: 0 0 auto;
  min-width: 75px;
  min-height: 39px;
  padding: 0 16px;
  border: 1px solid rgba(
    148,
    163,
    184,
    0.16
  );
  border-radius: 12px;
  background: #0d192a;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.filter-tabs button.active {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
  box-shadow:
    0 8px 18px
    rgba(37, 99, 235, 0.22);
}

.records-list {
  display: grid;
  gap: 13px;
}

.record-card {
  padding: 18px;
  border: 1px solid rgba(
    148,
    163,
    184,
    0.14
  );
  border-radius: 20px;
  background: #0d192a;
}

.record-main {
  display: grid;
  grid-template-columns:
    54px minmax(0, 1fr);
  gap: 15px;
}

.record-symbol {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border-radius: 16px;
  font-size: 21px;
  font-weight: 900;
}

.lost-record-symbol {
  background: rgba(
    239,
    68,
    68,
    0.13
  );
  color: #fb7185;
}

.found-record-symbol {
  background: rgba(
    16,
    185,
    129,
    0.13
  );
  color: #34d399;
}

.record-content {
  min-width: 0;
}

.record-heading {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.record-heading h3 {
  margin: 0 0 8px;
  color: #f8fafc;
  font-size: 18px;
  font-weight: 900;
}

.date {
  flex: 0 0 auto;
  color: #64748b;
  font-size: 11px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
}

.lost-badge {
  border: 1px solid rgba(
    248,
    113,
    113,
    0.2
  );
  background: rgba(
    239,
    68,
    68,
    0.13
  );
  color: #fda4af;
}

.found-badge {
  border: 1px solid rgba(
    52,
    211,
    153,
    0.2
  );
  background: rgba(
    16,
    185,
    129,
    0.13
  );
  color: #6ee7b7;
}

.claimed-badge {
  border: 1px solid rgba(
    74,
    222,
    128,
    0.2
  );
  background: rgba(
    34,
    197,
    94,
    0.13
  );
  color: #86efac;
}

.unclaimed-badge {
  border: 1px solid rgba(
    251,
    191,
    36,
    0.18
  );
  background: rgba(
    245,
    158,
    11,
    0.12
  );
  color: #fcd34d;
}

.record-description {
  margin: 13px 0 10px;
  color: #aab6c8;
  line-height: 1.55;
  font-size: 13px;
}

.record-location {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7f91aa;
  font-size: 12px;
}

.record-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(
    148,
    163,
    184,
    0.1
  );
}

.record-actions button {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 11px;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.claim-button {
  border: 1px solid rgba(
    34,
    197,
    94,
    0.25
  );
  background: rgba(
    34,
    197,
    94,
    0.12
  );
  color: #86efac;
}

.unclaim-button {
  border: 1px solid rgba(
    245,
    158,
    11,
    0.22
  );
  background: rgba(
    245,
    158,
    11,
    0.1
  );
  color: #fcd34d;
}

.edit-button {
  border: 1px solid rgba(
    59,
    130,
    246,
    0.25
  );
  background: rgba(
    37,
    99,
    235,
    0.11
  );
  color: #93c5fd;
}

.delete-button {
  border: 1px solid rgba(
    239,
    68,
    68,
    0.23
  );
  background: rgba(
    239,
    68,
    68,
    0.1
  );
  color: #fda4af;
}

.secondary-action {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  background: #2563eb;
  color: white;
  font-weight: 850;
}

/* ==================================
   BOTTOM NAV
================================== */

.bottom-navigation {
  position: fixed;
  z-index: 1000;
  left: 50%;
  bottom: 14px;
  display: grid;
  width: min(
    460px,
    calc(100% - 26px)
  );
  min-height: 72px;
  grid-template-columns:
    1fr 86px 1fr;
  align-items: center;
  transform: translateX(-50%);
  border: 1px solid rgba(
    148,
    163,
    184,
    0.18
  );
  border-radius: 24px;
  background: rgba(
    10,
    23,
    40,
    0.95
  );
  box-shadow:
    0 18px 45px
    rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(20px);
}

.nav-item {
  display: flex;
  min-height: 62px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 0;
  background: transparent;
  color: #71829a;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.nav-icon {
  font-size: 23px;
  line-height: 1;
}

.nav-item.active {
  color: #3b82f6;
}

.nav-add {
  display: grid;
  width: 62px;
  height: 62px;
  place-items: center;
  justify-self: center;
  transform: translateY(-17px);
  border: 5px solid #07111f;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    #2580ff,
    #3154ee
  );
  color: white;
  box-shadow:
    0 10px 25px
    rgba(37, 99, 235, 0.4);
  cursor: pointer;
}

.nav-add span {
  font-size: 34px;
  font-weight: 300;
  line-height: 1;
}

.nav-add.active {
  background: linear-gradient(
    135deg,
    #7c3aed,
    #2563eb
  );
}

/* ==================================
   RESPONSIVE
================================== */

@media (max-width: 800px) {
  .recent-list {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns:
      1fr 1fr;
  }
}

@media (max-width: 600px) {
  ion-toolbar {
    min-height: 58px;
  }

  .app-container {
    width: calc(100% - 24px);
    padding-top: 20px;
  }

  .welcome-mark {
    width: 58px;
    height: 58px;
    border-radius: 18px;
    font-size: 29px;
  }

  .welcome-row h1 {
    font-size: 31px;
  }

  .welcome-text {
    font-size: 13px;
  }

  .hero-card {
    padding: 23px;
    border-radius: 22px;
  }

  .hero-card h2 {
    font-size: 26px;
  }

  .hero-card p {
    font-size: 13px;
  }

  .hero-button {
    width: 100%;
    justify-content: center;
  }

  .stat-box {
    min-height: 88px;
    padding: 13px;
    border-radius: 17px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .stat-box strong {
    font-size: 22px;
  }

  .section-heading h2 {
    font-size: 18px;
  }

  .form-card {
    padding: 18px;
    border-radius: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .screen-title h1,
  .records-title h1 {
    font-size: 27px;
  }

  .record-card {
    padding: 15px;
  }

  .record-heading {
    flex-direction: column;
    gap: 0;
  }

  .record-actions {
    display: grid;
    grid-template-columns:
      1fr 1fr;
  }

  .record-actions button:first-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 380px) {
  .app-container {
    width: calc(100% - 18px);
  }

  .welcome-mark {
    display: none;
  }

  .stats-grid {
    gap: 8px;
  }

  .stat-box {
    gap: 9px;
    padding: 10px;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .record-main {
    grid-template-columns:
      44px minmax(0, 1fr);
    gap: 11px;
  }

  .record-symbol {
    width: 44px;
    height: 44px;
    border-radius: 13px;
  }
}
</style>