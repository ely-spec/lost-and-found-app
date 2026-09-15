<template>
  <ion-page>
    <!-- ================= HEADER ================= -->
    <ion-header class="app-header" :translucent="true">
      <ion-toolbar>
        <div class="header-content">
          <div
            v-if="activeScreen !== 'form'"
            class="brand"
            @click="goHome"
          >
            <div class="brand-logo">
              <ion-icon :icon="cubeOutline"></ion-icon>
            </div>

            <div>
              <h1>Lost & Found</h1>
              <p v-if="activeScreen === 'home'">
                Find it. Report it. Reunite it.
              </p>
              <p v-else>
                All reported items in one place.
              </p>
            </div>
          </div>

          <div v-else class="form-header">
            <button class="back-button" @click="goHome">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
            </button>

            <div>
              <h1>
                {{ isEditing ? 'Edit Item' : 'Report an Item' }}
              </h1>

              <p>
                {{
                  isEditing
                    ? 'Update the information below.'
                    : 'Help reunite lost items with their owners.'
                }}
              </p>
            </div>
          </div>

          <div v-if="activeScreen === 'home'" class="notification-wrapper">
            <button
              class="header-icon-button"
              aria-label="Open notifications"
              @click.stop="toggleNotifications"
            >
              <ion-icon :icon="notificationsOutline"></ion-icon>
              <span v-if="unreadCount > 0" class="notification-dot"></span>
              <span v-if="unreadCount > 0" class="notification-count">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>


          </div>

          <button
            v-if="activeScreen === 'records'"
            class="header-icon-button"
            aria-label="Open record filters"
            @click.stop="toggleFilterPanel"
          >
            <ion-icon :icon="optionsOutline"></ion-icon>
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <!-- NOTIFICATION OVERLAY: outside ion-header so Ionic cannot clip it -->
    <div v-if="notificationsOpen" class="notification-panel" @click.stop>
      <div class="notification-panel-header">
        <div>
          <h3>Notifications</h3>
          <p>{{ unreadCount }} unread</p>
        </div>

        <button
          v-if="unreadCount > 0"
          class="mark-read-button"
          @click="markAllAsRead"
        >
          Mark all as read
        </button>
      </div>

      <div v-if="notifications.length === 0" class="notification-empty">
        <ion-icon :icon="notificationsOutline"></ion-icon>
        <strong>No notifications yet</strong>
        <span>New reports and claimed items will appear here.</span>
      </div>

      <div v-else class="notification-list">
        <button
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !isNotificationRead(notification.id) }"
          @click="openNotification(notification.id)"
        >
          <span
            class="notification-item-icon"
            :class="notification.kind"
          >
            <ion-icon
              :icon="notification.kind === 'claimed'
                ? checkmarkCircleOutline
                : notification.kind === 'found'
                ? searchCircleOutline
                : alertCircleOutline"
            ></ion-icon>
          </span>

          <span class="notification-copy">
            <strong>{{ notification.title }}</strong>
            <span>{{ notification.message }}</span>
            <small>{{ notification.dateLabel }}</small>
          </span>

          <span
            v-if="!isNotificationRead(notification.id)"
            class="unread-dot"
          ></span>
        </button>
      </div>
    </div>

    <!-- RECORD FILTER OVERLAY -->
    <div v-if="filterPanelOpen" class="record-filter-panel" @click.stop>
      <div class="filter-panel-header">
        <div>
          <h3>Filter Records</h3>
          <p>Choose which reports you want to see.</p>
        </div>
        <button class="filter-close-button" @click="filterPanelOpen = false">×</button>
      </div>

      <div class="filter-panel-section">
        <strong>Item Type / Status</strong>
        <div class="filter-panel-grid">
          <button
            v-for="filter in filters"
            :key="`panel-${filter}`"
            :class="{ active: recordFilter === filter }"
            @click="applyPanelFilter(filter)"
          >
            {{ filter }}
          </button>
        </div>
      </div>

      <div class="filter-panel-section">
        <strong>Sort by Date</strong>
        <div class="filter-panel-grid two-column">
          <button :class="{ active: dateSort === 'newest' }" @click="dateSort = 'newest'">Newest First</button>
          <button :class="{ active: dateSort === 'oldest' }" @click="dateSort = 'oldest'">Oldest First</button>
        </div>
      </div>

      <button class="apply-filter-button" @click="applyFiltersAndOpenRecords">
        View {{ filteredItems.length }} {{ filteredItems.length === 1 ? 'Record' : 'Records' }}
      </button>
    </div>

    <!-- ================= CONTENT ================= -->
    <ion-content :fullscreen="true">
      <main class="app-container">

        <!-- ================================================= -->
        <!-- HOME SCREEN -->
        <!-- ================================================= -->

        <section
          v-if="activeScreen === 'home'"
          class="screen home-screen"
        >
          <!-- HERO -->
          <div class="hero-card">
            <div class="hero-circle circle-one"></div>
            <div class="hero-circle circle-two"></div>

            <div class="hero-content">
              <span class="hero-eyebrow">
                CAMPUS LOST & FOUND
              </span>

              <h2>
                Lost something?<br />
                Let's bring it back together.
              </h2>

              <p>
                Report lost or found items and help our community.
              </p>
            </div>

            <!-- ILLUSTRATION -->
            <div class="hero-visual">
              <div class="location-pin">
                <ion-icon :icon="location"></ion-icon>
              </div>

              <div class="student">
                <div class="student-head">
                  <div class="hair"></div>

                  <div class="face">
                    <span class="eye left-eye"></span>
                    <span class="eye right-eye"></span>
                    <span class="smile"></span>
                  </div>
                </div>

                <div class="student-body">
                  <div class="hood"></div>
                </div>
              </div>
            </div>

            <!-- QUICK ACTIONS -->
            <div class="quick-actions">
              <button
                class="quick-card"
                @click="openForm('Lost')"
              >
                <span class="quick-icon lost-action">
                  <ion-icon :icon="searchOutline"></ion-icon>
                </span>

                <span>
                  <strong>Report Lost</strong>
                  <small>I lost an item</small>
                </span>
              </button>

              <button
                class="quick-card"
                @click="openForm('Found')"
              >
                <span class="quick-icon found-action">
                  <ion-icon :icon="paperPlaneOutline"></ion-icon>
                </span>

                <span>
                  <strong>Report Found</strong>
                  <small>I found an item</small>
                </span>
              </button>
            </div>
          </div>

          <!-- SEARCH -->
          <div class="home-search-row">
            <div class="search-box">
              <ion-icon :icon="searchOutline"></ion-icon>

              <input
                v-model="searchText"
                type="text"
                placeholder="Search items, locations, or keywords..."
                @keyup.enter="searchFromHome"
              />
            </div>

            <button class="filter-button" aria-label="Open filters" @click.stop="toggleFilterPanel">
              <ion-icon :icon="optionsOutline"></ion-icon>
            </button>
          </div>

          <!-- STATISTICS -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon total-icon">
                <ion-icon :icon="cubeOutline"></ion-icon>
              </div>

              <strong>{{ items.length }}</strong>
              <small>Total Items</small>
            </div>

            <div class="stat-card">
              <div class="stat-icon lost-icon">
                <ion-icon :icon="alertCircleOutline"></ion-icon>
              </div>

              <strong>{{ lostCount }}</strong>
              <small>Lost Items</small>
            </div>

            <div class="stat-card">
              <div class="stat-icon found-icon">
                <ion-icon :icon="searchCircleOutline"></ion-icon>
              </div>

              <strong>{{ foundCount }}</strong>
              <small>Found Items</small>
            </div>

            <div class="stat-card">
              <div class="stat-icon claimed-icon">
                <ion-icon :icon="checkmarkCircle"></ion-icon>
              </div>

              <strong>{{ claimedCount }}</strong>
              <small>Claimed</small>
            </div>
          </div>

          <!-- RECENT -->
          <div class="section-header">
            <h2>Recent Reports</h2>

            <button @click="goRecords">
              See All
              <ion-icon :icon="arrowForwardOutline"></ion-icon>
            </button>
          </div>

          <div v-if="loading" class="state-card">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Loading reports...</p>
          </div>

          <div
            v-else-if="recentItems.length === 0"
            class="state-card"
          >
            <div class="state-icon">
              <ion-icon :icon="fileTrayOutline"></ion-icon>
            </div>

            <h3>No reports yet</h3>

            <p>
              Your latest lost and found reports will appear here.
            </p>

            <button
              class="small-primary-button"
              @click="openForm('Lost')"
            >
              Report an Item
            </button>
          </div>

          <div v-else class="recent-list">
            <article
              v-for="item in recentItems"
              :key="item.id"
              class="recent-item"
            >
              <div
                class="item-thumbnail"
                :class="
                  item.type === 'Lost'
                    ? 'lost-thumbnail'
                    : 'found-thumbnail'
                "
              >
                <ion-icon
                  :icon="getItemIcon(item.itemName)"
                ></ion-icon>
              </div>

              <div class="recent-information">
                <div class="recent-title">
                  <h3>{{ item.itemName }}</h3>

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
                </div>

                <div class="meta-information">
                  <span>
                    <ion-icon :icon="locationOutline"></ion-icon>
                    {{ item.location }}
                  </span>

                  <span>
                    <ion-icon :icon="calendarOutline"></ion-icon>
                    {{ formatDate(item.date) }}
                  </span>
                </div>
              </div>

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
            </article>
          </div>
        </section>

        <!-- ================================================= -->
        <!-- ADD / EDIT FORM SCREEN -->
        <!-- ================================================= -->

        <section
          v-if="activeScreen === 'form'"
          class="screen form-screen"
        >
          <!-- STEP INDICATOR -->
          <div class="stepper">
            <div
              v-for="step in 3"
              :key="step"
              class="step"
              :class="{ active: currentStep >= step }"
            >
              <div class="step-number">
                <ion-icon
                  v-if="currentStep > step"
                  :icon="checkmark"
                ></ion-icon>

                <template v-else>
                  {{ step }}
                </template>
              </div>

              <small>
                {{
                  step === 1
                    ? 'Details'
                    : step === 2
                    ? 'Location & Date'
                    : 'Review'
                }}
              </small>
            </div>
          </div>

          <div class="form-card">

            <!-- ================= STEP 1 ================= -->
            <div v-if="currentStep === 1">

              <!-- WORKING PHOTO PICKER -->
              <div
                class="photo-upload"
                :class="{ 'has-photo': photoPreview }"
                @click="openPhotoPicker"
              >
                <input
                  ref="photoInput"
                  class="photo-input"
                  type="file"
                  accept="image/*"
                  @change="handlePhotoSelected"
                />

                <!-- NO PHOTO -->
                <template v-if="!photoPreview">
                  <div class="camera-icon">
                    <ion-icon :icon="cameraOutline"></ion-icon>
                  </div>

                  <strong>Add a Photo</strong>

                  <span>
                    Tap to choose from Photos or Files
                  </span>

                  <p>
                    JPG, PNG or other image formats • Max 5 MB
                  </p>
                </template>

                <!-- PHOTO PREVIEW -->
                <template v-else>
                  <img
                    :src="photoPreview"
                    class="photo-preview"
                    alt="Selected item"
                  />

                  <div class="photo-overlay">
                    <ion-icon :icon="cameraOutline"></ion-icon>
                    <span>Change Photo</span>
                  </div>
                </template>
              </div>

              <!-- REMOVE PHOTO -->
              <button
                v-if="photoPreview"
                type="button"
                class="remove-photo-button"
                @click.stop="removePhoto"
              >
                <ion-icon :icon="trashOutline"></ion-icon>
                Remove Photo
              </button>

              <!-- ITEM DETAILS TITLE -->
              <div class="form-title">
                <div class="form-title-icon">
                  <ion-icon :icon="documentTextOutline"></ion-icon>
                </div>

                <div>
                  <h2>Item Details</h2>
                  <p>Tell us about the item.</p>
                </div>
              </div>

              <!-- ITEM NAME -->
              <div class="field">
                <label>
                  Item Name
                  <span>*</span>
                </label>

                <ion-input
                  v-model="form.itemName"
                  fill="outline"
                  placeholder="e.g. Black Wallet"
                ></ion-input>
              </div>

              <!-- DESCRIPTION -->
              <div class="field">
                <label>
                  Description
                  <span>*</span>
                </label>

                <ion-textarea
                  v-model="form.description"
                  fill="outline"
                  placeholder="Color, brand, unique details..."
                  :auto-grow="true"
                  :maxlength="200"
                ></ion-textarea>

                <small class="character-count">
                  {{ form.description.length }}/200
                </small>
              </div>

              <!-- LOST / FOUND -->
              <div class="field">
                <label>
                  Type of Item
                  <span>*</span>
                </label>

                <div class="choice-grid">
                  <button
                    type="button"
                    class="choice-card"
                    :class="{
                      'lost-selected': form.type === 'Lost'
                    }"
                    @click="form.type = 'Lost'"
                  >
                    <ion-icon :icon="sadOutline"></ion-icon>

                    <strong>Lost</strong>
                    <small>I lost this item</small>
                  </button>

                  <button
                    type="button"
                    class="choice-card"
                    :class="{
                      'found-selected': form.type === 'Found'
                    }"
                    @click="form.type = 'Found'"
                  >
                    <ion-icon :icon="happyOutline"></ion-icon>

                    <strong>Found</strong>
                    <small>I found this item</small>
                  </button>
                </div>
              </div>

              <!-- STATUS -->
              <div class="field">
                <label>
                  Item Status
                  <span>*</span>
                </label>

                <div class="choice-grid">
                  <button
                    type="button"
                    class="status-choice"
                    :class="{
                      'unclaimed-selected':
                        form.status === 'Unclaimed'
                    }"
                    @click="form.status = 'Unclaimed'"
                  >
                    <ion-icon :icon="lockClosedOutline"></ion-icon>

                    <div>
                      <strong>Unclaimed</strong>
                      <small>Still looking for owner</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    class="status-choice"
                    :class="{
                      'claimed-selected':
                        form.status === 'Claimed'
                    }"
                    @click="form.status = 'Claimed'"
                  >
                    <ion-icon
                      :icon="checkmarkCircleOutline"
                    ></ion-icon>

                    <div>
                      <strong>Claimed</strong>
                      <small>Already returned</small>
                    </div>
                  </button>
                </div>
              </div>

              <button
                class="primary-button"
                @click="nextStep"
              >
                Next
                <ion-icon :icon="arrowForwardOutline"></ion-icon>
              </button>
            </div>

            <!-- ================= STEP 2 ================= -->
            <div v-if="currentStep === 2">
              <div class="form-title">
                <div class="form-title-icon">
                  <ion-icon :icon="locationOutline"></ion-icon>
                </div>

                <div>
                  <h2>Location & Date</h2>

                  <p>
                    Where and when was the item lost or found?
                  </p>
                </div>
              </div>

              <!-- LOCATION -->
              <div class="field">
                <label>
                  Location
                  <span>*</span>
                </label>

                <div class="custom-input">
                  <ion-icon :icon="locationOutline"></ion-icon>

                  <ion-input
                    v-model="form.location"
                    placeholder="e.g. School Library"
                  ></ion-input>
                </div>
              </div>

              <!-- DATE -->
              <div class="field">
                <label>
                  Date
                  <span>*</span>
                </label>

                <div class="custom-input">
                  <ion-icon :icon="calendarOutline"></ion-icon>

                  <ion-input
                    v-model="form.date"
                    type="date"
                  ></ion-input>
                </div>
              </div>

              <div class="navigation-buttons">
                <button
                  class="secondary-button"
                  @click="currentStep = 1"
                >
                  <ion-icon :icon="arrowBackOutline"></ion-icon>
                  Back
                </button>

                <button
                  class="primary-button"
                  @click="nextStep"
                >
                  Review
                  <ion-icon :icon="arrowForwardOutline"></ion-icon>
                </button>
              </div>
            </div>

            <!-- ================= STEP 3 ================= -->
            <div v-if="currentStep === 3">
              <div class="form-title">
                <div class="form-title-icon">
                  <ion-icon
                    :icon="checkmarkCircleOutline"
                  ></ion-icon>
                </div>

                <div>
                  <h2>Review Report</h2>
                  <p>Check your report before submitting.</p>
                </div>
              </div>

              <div class="review-card">

                <!-- REVIEW PHOTO -->
                <img
                  v-if="photoPreview"
                  :src="photoPreview"
                  class="review-photo"
                  alt="Item preview"
                />

                <div
                  v-else
                  class="review-placeholder"
                >
                  <ion-icon
                    :icon="getItemIcon(form.itemName)"
                  ></ion-icon>
                </div>

                <h2>{{ form.itemName }}</h2>

                <div class="review-badges">
                  <span
                    class="badge"
                    :class="
                      form.type === 'Lost'
                        ? 'lost-badge'
                        : 'found-badge'
                    "
                  >
                    {{ form.type }}
                  </span>

                  <span
                    class="badge"
                    :class="
                      form.status === 'Claimed'
                        ? 'claimed-badge'
                        : 'unclaimed-badge'
                    "
                  >
                    {{ form.status }}
                  </span>
                </div>

                <p>{{ form.description }}</p>

                <div class="review-information">
                  <span>
                    <ion-icon :icon="locationOutline"></ion-icon>
                    {{ form.location }}
                  </span>

                  <span>
                    <ion-icon :icon="calendarOutline"></ion-icon>
                    {{ formatDate(form.date) }}
                  </span>

                  <span v-if="selectedPhoto">
                    <ion-icon :icon="cameraOutline"></ion-icon>
                    {{ selectedPhoto.name }}
                  </span>
                </div>
              </div>

              <div class="navigation-buttons">
                <button
                  class="secondary-button"
                  @click="currentStep = 2"
                >
                  <ion-icon :icon="arrowBackOutline"></ion-icon>
                  Back
                </button>

                <button
                  class="primary-button"
                  :disabled="loading"
                  @click="saveItem"
                >
                  <ion-spinner
                    v-if="loading"
                    name="crescent"
                  ></ion-spinner>

                  <template v-else>
                    <ion-icon
                      :icon="
                        isEditing
                          ? saveOutline
                          : checkmarkCircleOutline
                      "
                    ></ion-icon>

                    {{
                      isEditing
                        ? 'Update Item'
                        : 'Submit Report'
                    }}
                  </template>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ================================================= -->
        <!-- RECORDS SCREEN -->
        <!-- ================================================= -->

        <section
          v-if="activeScreen === 'records'"
          class="screen records-screen"
        >
          <div class="records-search">
            <ion-icon :icon="searchOutline"></ion-icon>

            <input
              v-model="searchText"
              type="text"
              placeholder="Search items, locations, or keywords..."
            />
          </div>

          <!-- FILTERS -->
          <div class="filter-chips">
            <button
              v-for="filter in filters"
              :key="filter"
              :class="{ active: recordFilter === filter }"
              @click="recordFilter = filter"
            >
              {{ filter }}
            </button>
          </div>

          <!-- RECORDS HEADER -->
          <div class="records-header">
            <div>
              <h2>Item Records</h2>

              <p>
                {{ filteredItems.length }}
                {{
                  filteredItems.length === 1
                    ? 'record'
                    : 'records'
                }}
              </p>
            </div>

            <button
              class="refresh-button"
              @click="loadItems"
            >
              <ion-icon :icon="refreshOutline"></ion-icon>
            </button>
          </div>

          <!-- LOADING -->
          <div v-if="loading" class="state-card">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Loading records...</p>
          </div>

          <!-- EMPTY -->
          <div
            v-else-if="filteredItems.length === 0"
            class="state-card"
          >
            <div class="state-icon">
              <ion-icon :icon="searchOutline"></ion-icon>
            </div>

            <h3>No items found</h3>

            <p>
              Try changing your search or report a new item.
            </p>
          </div>

          <!-- RECORD LIST -->
          <div v-else class="records-list">
            <article
              v-for="item in filteredItems"
              :key="item.id"
              class="record-card"
            >
              <div
                class="record-thumbnail"
                :class="
                  item.type === 'Lost'
                    ? 'lost-thumbnail'
                    : 'found-thumbnail'
                "
              >
                <ion-icon
                  :icon="getItemIcon(item.itemName)"
                ></ion-icon>
              </div>

              <div class="record-main">
                <h3>{{ item.itemName }}</h3>

                <span>
                  <ion-icon :icon="locationOutline"></ion-icon>
                  {{ item.location }}
                </span>

                <span>
                  <ion-icon :icon="calendarOutline"></ion-icon>
                  {{ formatDate(item.date) }}
                </span>

                <p>
                  {{ item.description }}
                </p>
              </div>

              <div class="record-badges">
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

              <!-- MENU -->
              <div class="menu-wrapper">
                <button
                  class="menu-button"
                  @click="toggleMenu(item.id)"
                >
                  <ion-icon :icon="ellipsisVertical"></ion-icon>
                </button>

                <div
                  v-if="openedMenu === item.id"
                  class="item-menu"
                >
                  <button @click="editItem(item)">
                    <ion-icon :icon="createOutline"></ion-icon>
                    Edit
                  </button>

                  <button
                    class="delete-option"
                    @click="deleteItemRecord(item.id)"
                  >
                    <ion-icon :icon="trashOutline"></ion-icon>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      <!-- TOAST -->
      <ion-toast
        :is-open="toastOpen"
        :message="toastMessage"
        :duration="2200"
        position="top"
        @didDismiss="toastOpen = false"
      ></ion-toast>
    </ion-content>

    <!-- ================================================= -->
    <!-- BOTTOM NAVIGATION -->
    <!-- ================================================= -->

    <nav class="bottom-nav">
      <button
        class="nav-button"
        :class="{ active: activeScreen === 'home' }"
        @click="goHome"
      >
        <ion-icon
          :icon="
            activeScreen === 'home'
              ? home
              : homeOutline
          "
        ></ion-icon>

        <span>Home</span>
      </button>

      <button
        class="add-button"
        :class="{ active: activeScreen === 'form' }"
        @click="openForm()"
      >
        <ion-icon :icon="add"></ion-icon>
      </button>

      <button
        class="nav-button"
        :class="{ active: activeScreen === 'records' }"
        @click="goRecords"
      >
        <ion-icon
          :icon="
            activeScreen === 'records'
              ? list
              : listOutline
          "
        ></ion-icon>

        <span>Records</span>
      </button>
    </nav>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonInput,
  IonTextarea,
  IonIcon,
  IonToast,
  IonSpinner
} from '@ionic/vue';

import {
  add,
  alertCircleOutline,
  arrowBackOutline,
  arrowForwardOutline,
  calendarOutline,
  cameraOutline,
  checkmark,
  checkmarkCircle,
  checkmarkCircleOutline,
  createOutline,
  cubeOutline,
  documentTextOutline,
  ellipsisVertical,
  fileTrayOutline,
  happyOutline,
  home,
  homeOutline,
  keyOutline,
  list,
  listOutline,
  location,
  locationOutline,
  lockClosedOutline,
  notificationsOutline,
  optionsOutline,
  paperPlaneOutline,
  phonePortraitOutline,
  refreshOutline,
  sadOutline,
  saveOutline,
  searchCircleOutline,
  searchOutline,
  trashOutline,
  walletOutline
} from 'ionicons/icons';

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
  onUnmounted,
  reactive,
  ref
} from 'vue';

import { db } from '../firebase';

/* =========================================================
   TYPES
========================================================= */

interface LostFoundItem {
  id: string;
  itemName: string;
  description: string;
  location: string;
  date: string;
  type: 'Lost' | 'Found';
  status: 'Unclaimed' | 'Claimed';
}

type Screen =
  | 'home'
  | 'form'
  | 'records';

/* =========================================================
   APP STATE
========================================================= */

const activeScreen =
  ref<Screen>('home');

const currentStep =
  ref(1);

const items =
  ref<LostFoundItem[]>([]);

const loading =
  ref(false);

const isEditing =
  ref(false);

const editingId =
  ref('');

const searchText =
  ref('');

const recordFilter =
  ref('All');

const toastOpen =
  ref(false);

const toastMessage =
  ref('');

const openedMenu =
  ref('');

/* =========================================================
   NOTIFICATIONS
========================================================= */

const notificationsOpen = ref(false);
const notificationTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const filterPanelOpen = ref(false);
const dateSort = ref<'newest' | 'oldest'>('newest');
const readNotificationIds = ref<string[]>([]);

const notifications = computed(() => {
  return items.value.slice(0, 8).map((item) => {
    const kind = item.status === 'Claimed'
      ? 'claimed'
      : item.type === 'Found'
      ? 'found'
      : 'lost';

    return {
      id: `${item.id}-${item.status}`,
      kind,
      title: item.status === 'Claimed'
        ? 'Item Claimed!'
        : item.type === 'Found'
        ? 'New Found Item'
        : 'New Lost Item',
      message: item.status === 'Claimed'
        ? `${item.itemName} has been marked as claimed.`
        : `${item.itemName} was reported ${item.type.toLowerCase()} at ${item.location}.`,
      dateLabel: formatDate(item.date)
    };
  });
});

const unreadCount = computed(() => {
  return notifications.value.filter(
    (notification) => !readNotificationIds.value.includes(notification.id)
  ).length;
});

const isNotificationRead = (id: string) => {
  return readNotificationIds.value.includes(id);
};

const saveReadNotifications = () => {
  localStorage.setItem(
    'lost-found-read-notifications',
    JSON.stringify(readNotificationIds.value)
  );
};

const clearNotificationTimer = () => {
  if (notificationTimer.value) {
    clearTimeout(notificationTimer.value);
    notificationTimer.value = null;
  }
};

const closeNotifications = (markRead = true) => {
  clearNotificationTimer();
  if (markRead && notificationsOpen.value) {
    markAllAsRead();
  }
  notificationsOpen.value = false;
};

const startNotificationTimer = () => {
  clearNotificationTimer();
  notificationTimer.value = setTimeout(() => {
    closeNotifications(true);
  }, 3000);
};

const toggleNotifications = () => {
  filterPanelOpen.value = false;
  if (notificationsOpen.value) {
    closeNotifications(true);
    return;
  }
  notificationsOpen.value = true;
  startNotificationTimer();
};

const markAllAsRead = () => {
  readNotificationIds.value = notifications.value.map(
    (notification) => notification.id
  );
  saveReadNotifications();
};

const openNotification = (id: string) => {
  clearNotificationTimer();
  if (!readNotificationIds.value.includes(id)) {
    readNotificationIds.value.push(id);
    saveReadNotifications();
  }

  notificationsOpen.value = false;
  activeScreen.value = 'records';
};

const toggleFilterPanel = () => {
  closeNotifications(true);
  filterPanelOpen.value = !filterPanelOpen.value;
};

const applyPanelFilter = (filter: string) => {
  recordFilter.value = filter;
};

const applyFiltersAndOpenRecords = () => {
  filterPanelOpen.value = false;
  activeScreen.value = 'records';
};

const handleOutsideClick = () => {
  if (notificationsOpen.value) closeNotifications(true);
  if (filterPanelOpen.value) filterPanelOpen.value = false;
  openedMenu.value = '';
};

/* =========================================================
   PHOTO PICKER
========================================================= */

const photoInput =
  ref<HTMLInputElement | null>(null);

const selectedPhoto =
  ref<File | null>(null);

const photoPreview =
  ref('');

const openPhotoPicker = () => {
  photoInput.value?.click();
};

const clearPhotoPreviewUrl = () => {
  if (
    photoPreview.value &&
    photoPreview.value.startsWith('blob:')
  ) {
    URL.revokeObjectURL(
      photoPreview.value
    );
  }
};

const handlePhotoSelected = (
  event: Event
) => {
  const input =
    event.target as HTMLInputElement;

  if (
    !input.files ||
    input.files.length === 0
  ) {
    return;
  }

  const file =
    input.files[0];

  /* IMAGE ONLY */
  if (
    !file.type.startsWith('image/')
  ) {
    showToast(
      'Please select an image file.'
    );

    input.value = '';

    return;
  }

  /* MAX 5 MB */
  const maximumSize =
    5 * 1024 * 1024;

  if (
    file.size > maximumSize
  ) {
    showToast(
      'Photo must be smaller than 5 MB.'
    );

    input.value = '';

    return;
  }

  clearPhotoPreviewUrl();

  selectedPhoto.value =
    file;

  photoPreview.value =
    URL.createObjectURL(file);

  showToast(
    'Photo selected successfully.'
  );
};

const removePhoto = () => {
  clearPhotoPreviewUrl();

  selectedPhoto.value =
    null;

  photoPreview.value =
    '';

  if (
    photoInput.value
  ) {
    photoInput.value.value =
      '';
  }
};

/* =========================================================
   FILTERS
========================================================= */

const filters = [
  'All',
  'Lost',
  'Found',
  'Unclaimed',
  'Claimed'
];

/* =========================================================
   FORM
========================================================= */

const form = reactive({
  itemName: '',
  description: '',
  location: '',
  date: '',
  type: 'Lost' as 'Lost' | 'Found',
  status: 'Unclaimed' as
    | 'Unclaimed'
    | 'Claimed'
});

/* =========================================================
   TOAST
========================================================= */

const showToast = (
  message: string
) => {
  toastMessage.value =
    message;

  toastOpen.value =
    true;
};

/* =========================================================
   RESET FORM
========================================================= */

const resetForm = () => {
  form.itemName = '';
  form.description = '';
  form.location = '';
  form.date = '';
  form.type = 'Lost';
  form.status = 'Unclaimed';

  isEditing.value = false;
  editingId.value = '';

  currentStep.value = 1;

  removePhoto();
};

/* =========================================================
   NAVIGATION
========================================================= */

const goHome = () => {
  openedMenu.value = '';
  closeNotifications(true);
  filterPanelOpen.value = false;

  activeScreen.value =
    'home';

  currentStep.value =
    1;
};

const goRecords = () => {
  openedMenu.value = '';
  closeNotifications(true);
  filterPanelOpen.value = false;

  activeScreen.value =
    'records';
};

const openForm = (
  type?: 'Lost' | 'Found'
) => {
  closeNotifications(true);
  filterPanelOpen.value = false;
  resetForm();

  if (type) {
    form.type = type;
  }

  activeScreen.value =
    'form';
};

const searchFromHome = () => {
  activeScreen.value =
    'records';
};

/* =========================================================
   FORM STEPS
========================================================= */

const nextStep = () => {
  if (
    currentStep.value === 1
  ) {
    if (
      !form.itemName.trim() ||
      !form.description.trim()
    ) {
      showToast(
        'Please complete the item details.'
      );

      return;
    }

    currentStep.value = 2;

    return;
  }

  if (
    currentStep.value === 2
  ) {
    if (
      !form.location.trim() ||
      !form.date
    ) {
      showToast(
        'Please enter the location and date.'
      );

      return;
    }

    currentStep.value = 3;
  }
};

/* =========================================================
   CREATE / UPDATE
========================================================= */

const saveItem = async () => {
  if (
    !form.itemName.trim() ||
    !form.description.trim() ||
    !form.location.trim() ||
    !form.date
  ) {
    showToast(
      'Please complete all required fields.'
    );

    return;
  }

  try {
    loading.value = true;

    const itemData = {
      itemName:
        form.itemName.trim(),

      description:
        form.description.trim(),

      location:
        form.location.trim(),

      date:
        form.date,

      type:
        form.type,

      status:
        form.status
    };

    /* UPDATE */
    if (
      isEditing.value &&
      editingId.value
    ) {
      await updateDoc(
        doc(
          db,
          'items',
          editingId.value
        ),
        itemData
      );

      showToast(
        'Item updated successfully.'
      );
    }

    /* CREATE */
    else {
      await addDoc(
        collection(
          db,
          'items'
        ),
        {
          ...itemData,
          createdAt:
            serverTimestamp()
        }
      );

      showToast(
        'Report submitted successfully.'
      );
    }

    /*
      IMPORTANT:

      selectedPhoto.value contains the
      selected image file.

      For now this version only provides:
      - Gallery / Files picker
      - Image validation
      - Image preview
      - Change photo
      - Remove photo

      Firebase Storage will be connected
      in the next step so the image itself
      can be permanently saved.
    */

    resetForm();

    await loadItems();

    activeScreen.value =
      'records';
  } catch (error) {
    console.error(
      'Error saving item:',
      error
    );

    showToast(
      'Unable to save item.'
    );
  } finally {
    loading.value =
      false;
  }
};

/* =========================================================
   READ
========================================================= */

const loadItems = async () => {
  try {
    loading.value = true;

    const itemsQuery =
      query(
        collection(
          db,
          'items'
        ),

        orderBy(
          'createdAt',
          'desc'
        )
      );

    const snapshot =
      await getDocs(
        itemsQuery
      );

    items.value =
      snapshot.docs.map(
        (document) => {
          const data =
            document.data();

          return {
            id:
              document.id,

            itemName:
              data.itemName ?? '',

            description:
              data.description ?? '',

            location:
              data.location ?? '',

            date:
              data.date ?? '',

            type:
              data.type ?? 'Lost',

            status:
              data.status ?? 'Unclaimed'
          };
        }
      );
  } catch (error) {
    console.error(
      'Ordered loading failed:',
      error
    );

    /* FALLBACK */
    try {
      const snapshot =
        await getDocs(
          collection(
            db,
            'items'
          )
        );

      items.value =
        snapshot.docs.map(
          (document) => {
            const data =
              document.data();

            return {
              id:
                document.id,

              itemName:
                data.itemName ?? '',

              description:
                data.description ?? '',

              location:
                data.location ?? '',

              date:
                data.date ?? '',

              type:
                data.type ?? 'Lost',

              status:
                data.status ?? 'Unclaimed'
            };
          }
        );
    } catch (
      secondError
    ) {
      console.error(
        'Fallback loading error:',
        secondError
      );

      showToast(
        'Unable to load records.'
      );
    }
  } finally {
    loading.value =
      false;
  }
};

/* =========================================================
   EDIT
========================================================= */

const editItem = (
  item: LostFoundItem
) => {
  form.itemName =
    item.itemName;

  form.description =
    item.description;

  form.location =
    item.location;

  form.date =
    item.date;

  form.type =
    item.type;

  form.status =
    item.status;

  editingId.value =
    item.id;

  isEditing.value =
    true;

  currentStep.value =
    1;

  openedMenu.value =
    '';

  removePhoto();

  activeScreen.value =
    'form';
};

/* =========================================================
   DELETE
========================================================= */

const deleteItemRecord =
  async (id: string) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this record?'
      );

    if (!confirmed) {
      return;
    }

    try {
      loading.value =
        true;

      await deleteDoc(
        doc(
          db,
          'items',
          id
        )
      );

      openedMenu.value =
        '';

      showToast(
        'Item deleted successfully.'
      );

      await loadItems();
    } catch (error) {
      console.error(
        'Error deleting item:',
        error
      );

      showToast(
        'Unable to delete item.'
      );
    } finally {
      loading.value =
        false;
    }
  };

/* =========================================================
   MENU
========================================================= */

const toggleMenu = (
  id: string
) => {
  openedMenu.value =
    openedMenu.value === id
      ? ''
      : id;
};

/* =========================================================
   STATISTICS
========================================================= */

const lostCount =
  computed(() => {
    return items.value.filter(
      (item) =>
        item.type === 'Lost'
    ).length;
  });

const foundCount =
  computed(() => {
    return items.value.filter(
      (item) =>
        item.type === 'Found'
    ).length;
  });

const claimedCount =
  computed(() => {
    return items.value.filter(
      (item) =>
        item.status === 'Claimed'
    ).length;
  });

/* =========================================================
   RECENT
========================================================= */

const recentItems =
  computed(() => {
    return items.value.slice(
      0,
      4
    );
  });

/* =========================================================
   SEARCH + FILTER
========================================================= */

const filteredItems =
  computed(() => {
    const search =
      searchText.value
        .toLowerCase()
        .trim();

    const result = items.value.filter(
      (item) => {
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

        const matchesFilter =
          recordFilter.value === 'All' ||

          item.type ===
            recordFilter.value ||

          item.status ===
            recordFilter.value;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );

    return result.sort((a, b) => {
      const aTime = new Date(`${a.date}T00:00:00`).getTime() || 0;
      const bTime = new Date(`${b.date}T00:00:00`).getTime() || 0;
      return dateSort.value === 'newest' ? bTime - aTime : aTime - bTime;
    });
  });

/* =========================================================
   DATE
========================================================= */

const formatDate = (
  date: string
) => {
  if (!date) {
    return '';
  }

  const parsed =
    new Date(
      `${date}T00:00:00`
    );

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }
  );
};

/* =========================================================
   ITEM ICON
========================================================= */

const getItemIcon = (
  name: string
) => {
  const value =
    name.toLowerCase();

  if (
    value.includes('wallet') ||
    value.includes('purse')
  ) {
    return walletOutline;
  }

  if (
    value.includes('phone') ||
    value.includes('iphone') ||
    value.includes('mobile')
  ) {
    return phonePortraitOutline;
  }

  if (
    value.includes('key')
  ) {
    return keyOutline;
  }

  return cubeOutline;
};

/* =========================================================
   LIFECYCLE
========================================================= */

onMounted(() => {
  try {
    const saved = localStorage.getItem('lost-found-read-notifications');
    if (saved) {
      readNotificationIds.value = JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Unable to load notification state:', error);
  }

  loadItems();
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  clearNotificationTimer();
  document.removeEventListener('click', handleOutsideClick);
  clearPhotoPreviewUrl();
});
</script>

<style scoped>
/* =========================================================
   BASE
========================================================= */

ion-content {
  --background:
    radial-gradient(
      circle at top left,
      rgba(126, 211, 255, 0.23),
      transparent 28%
    ),
    radial-gradient(
      circle at top right,
      rgba(109, 181, 255, 0.16),
      transparent 30%
    ),
    linear-gradient(
      180deg,
      #f8fcff 0%,
      #eef7ff 52%,
      #f8fbff 100%
    );

  --padding-bottom: 110px;
}

button,
input {
  font-family: inherit;
}

/* =========================================================
   HEADER
========================================================= */

.app-header {
  box-shadow: none;
  overflow: visible !important;
}

.app-header ion-toolbar {
  overflow: visible !important;
}

.app-header::after {
  display: none;
}

ion-toolbar {
  --background:
    rgba(
      249,
      253,
      255,
      0.94
    );

  --border-color:
    transparent;

  min-height: 76px;

  backdrop-filter:
    blur(20px);
}

.header-content {
  width:
    min(
      100% - 28px,
      720px
    );

  min-height: 76px;

  margin: auto;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;

  gap: 11px;

  cursor: pointer;
}

.brand-logo {
  width: 45px;
  height: 45px;

  display: grid;
  place-items: center;

  border-radius: 14px;

  color: white;

  background:
    linear-gradient(
      145deg,
      #3db7f2,
      #0871e7
    );

  box-shadow:
    0 9px 22px
    rgba(
      20,
      112,
      222,
      0.23
    );
}

.brand-logo ion-icon {
  font-size: 24px;
}

.brand h1,
.form-header h1 {
  margin: 0;

  color: #0b2b60;

  font-size: 19px;
  font-weight: 900;
}

.brand p,
.form-header p {
  margin:
    2px 0 0;

  color: #6b82a1;

  font-size: 10px;
}

.header-icon-button,
.back-button {
  width: 43px;
  height: 43px;

  flex-shrink: 0;

  border:
    1px solid
    #dfeaf4;

  border-radius: 14px;

  display: grid;
  place-items: center;

  color: #173a70;

  background:
    rgba(
      255,
      255,
      255,
      0.95
    );

  box-shadow:
    0 6px 17px
    rgba(
      42,
      88,
      140,
      0.08
    );

  position: relative;
}

.header-icon-button ion-icon,
.back-button ion-icon {
  font-size: 21px;
}

.notification-dot {
  position: absolute;

  width: 8px;
  height: 8px;

  top: 7px;
  right: 7px;

  border:
    2px solid white;

  border-radius: 50%;

  background: #f0445c;
}

.notification-wrapper {
  position: relative;
}

.notification-count {
  position: absolute;
  top: -5px;
  right: -6px;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  border: 2px solid white;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: white;
  background: #f0445c;
  font-size: 8px;
  font-weight: 900;
  line-height: 1;
}

.notification-wrapper .notification-dot {
  display: none;
}

.notification-panel {
  position: fixed;
  z-index: 99999;
  top: 70px;
  right: max(12px, calc((100vw - 720px) / 2 + 12px));
  width: min(360px, calc(100vw - 24px));
  max-height: min(520px, calc(100vh - 92px));
  overflow: hidden;
  border: 1px solid #dce9f4;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 22px 55px rgba(28, 65, 108, 0.22);
  backdrop-filter: blur(22px);
}

.notification-panel-header {
  padding: 16px;
  border-bottom: 1px solid #e8f0f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.notification-panel-header h3 {
  margin: 0;
  color: #0b2b60;
  font-size: 15px;
  font-weight: 900;
}

.notification-panel-header p {
  margin: 2px 0 0;
  color: #7c90aa;
  font-size: 9px;
}

.mark-read-button {
  border: 0;
  padding: 7px 9px;
  border-radius: 9px;
  color: #0b6bdc;
  background: #eaf4ff;
  font-size: 8px;
  font-weight: 850;
}

.notification-list {
  max-height: 410px;
  overflow-y: auto;
  padding: 7px;
}

.notification-item {
  width: 100%;
  padding: 10px;
  border: 0;
  border-radius: 14px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 8px;
  align-items: center;
  gap: 9px;
  color: inherit;
  background: transparent;
  text-align: left;
}

.notification-item + .notification-item {
  margin-top: 2px;
}

.notification-item.unread {
  background: #f0f7ff;
}

.notification-item-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 19px;
}

.notification-item-icon.lost { color: #d43851; background: #ffe8ec; }
.notification-item-icon.found { color: #087d86; background: #dcf8f5; }
.notification-item-icon.claimed { color: #6d55d9; background: #eeeaff; }

.notification-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.notification-copy strong {
  color: #12315f;
  font-size: 10px;
  font-weight: 900;
}

.notification-copy > span {
  margin-top: 2px;
  color: #5f7695;
  font-size: 9px;
  line-height: 1.35;
}

.notification-copy small {
  margin-top: 4px;
  color: #93a3b8;
  font-size: 8px;
}

.unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #1477ea;
}

.notification-empty {
  min-height: 170px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.notification-empty ion-icon {
  margin-bottom: 8px;
  color: #3888e8;
  font-size: 29px;
}

.notification-empty strong {
  color: #17355f;
  font-size: 11px;
}

.notification-empty span {
  margin-top: 4px;
  color: #8295ad;
  font-size: 9px;
}

.form-header {
  display: flex;
  align-items: center;

  gap: 12px;
}

/* =========================================================
   CONTAINER
========================================================= */

.app-container {
  width:
    min(
      100% - 24px,
      720px
    );

  margin: auto;

  padding:
    16px 0
    calc(
      110px +
      env(
        safe-area-inset-bottom
      )
    );
}

.screen {
  animation:
    screenEnter
    0.25s ease;
}

@keyframes screenEnter {
  from {
    opacity: 0;
    transform:
      translateY(7px);
  }

  to {
    opacity: 1;
    transform:
      translateY(0);
  }
}

/* =========================================================
   HERO
========================================================= */

.hero-card {
  min-height: 320px;

  position: relative;

  overflow: hidden;

  padding:
    29px
    22px
    90px;

  border:
    1px solid
    rgba(
      255,
      255,
      255,
      0.95
    );

  border-radius: 28px;

  background:
    linear-gradient(
      145deg,
      #eaf8ff,
      #d9f0ff 50%,
      #cae9ff
    );

  box-shadow:
    0 18px 40px
    rgba(
      57,
      126,
      181,
      0.14
    );
}

.hero-card::after {
  content: '';

  position: absolute;

  left: -10%;
  bottom: -50px;

  width: 120%;
  height: 125px;

  border-radius: 50%;

  background:
    linear-gradient(
      145deg,
      #8dd6ad,
      #65c596
    );
}

.hero-circle {
  position: absolute;

  border-radius: 50%;

  background:
    rgba(
      255,
      255,
      255,
      0.3
    );
}

.circle-one {
  width: 180px;
  height: 180px;

  top: -80px;
  right: -35px;
}

.circle-two {
  width: 90px;
  height: 90px;

  top: 90px;
  right: 50px;
}

.hero-content {
  width: 65%;

  position: relative;

  z-index: 4;
}

.hero-eyebrow {
  display: inline-block;

  margin-bottom: 9px;

  color: #1680d9;

  font-size: 9px;
  font-weight: 900;

  letter-spacing: 1px;
}

.hero-content h2 {
  margin:
    0 0 11px;

  color: #08265c;

  font-size:
    clamp(
      24px,
      7vw,
      34px
    );

  font-weight: 950;

  line-height: 1.08;

  letter-spacing: -1px;
}

.hero-content p {
  max-width: 250px;

  margin: 0;

  color: #527097;

  font-size: 11px;

  line-height: 1.55;
}

/* =========================================================
   HERO CHARACTER
========================================================= */

.hero-visual {
  width: 130px;
  height: 180px;

  position: absolute;

  right: 6px;
  bottom: 65px;

  z-index: 5;
}

.location-pin {
  width: 50px;
  height: 50px;

  position: absolute;

  left: -15px;
  top: 25px;

  border-radius:
    50%
    50%
    50%
    8px;

  display: grid;
  place-items: center;

  transform:
    rotate(-45deg);

  color: white;

  background:
    linear-gradient(
      145deg,
      #4ca9fa,
      #176de2
    );

  box-shadow:
    0 10px 22px
    rgba(
      28,
      111,
      225,
      0.28
    );
}

.location-pin ion-icon {
  font-size: 25px;

  transform:
    rotate(45deg);
}

.student {
  width: 100px;
  height: 150px;

  position: absolute;

  right: 0;
  bottom: 0;
}

.student-head {
  width: 72px;
  height: 78px;

  margin: auto;

  position: relative;
}

.face {
  width: 58px;
  height: 61px;

  position: absolute;

  left: 7px;
  top: 14px;

  border-radius:
    48%
    48%
    44%
    44%;

  background:
    linear-gradient(
      145deg,
      #ffd2ac,
      #efb37f
    );
}

.hair {
  width: 74px;
  height: 37px;

  position: absolute;

  z-index: 2;

  top: 0;

  border-radius:
    55%
    55%
    35%
    25%;

  background: #173553;
}

.eye {
  width: 4px;
  height: 5px;

  position: absolute;

  top: 28px;

  border-radius: 50%;

  background: #23364e;
}

.left-eye {
  left: 15px;
}

.right-eye {
  right: 15px;
}

.smile {
  width: 14px;
  height: 7px;

  position: absolute;

  left: 22px;
  bottom: 14px;

  border-bottom:
    2px solid
    #b85e55;

  border-radius: 50%;
}

.student-body {
  width: 100px;
  height: 83px;

  margin-top: -2px;

  position: relative;

  border-radius:
    38px
    38px
    10px
    10px;

  background:
    linear-gradient(
      145deg,
      #167bc4,
      #07518e
    );
}

.hood {
  width: 55px;
  height: 23px;

  position: absolute;

  left: 22px;
  top: 0;

  border:
    3px solid
    rgba(
      255,
      255,
      255,
      0.4
    );

  border-top: 0;

  border-radius:
    0
    0
    30px
    30px;
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

.quick-actions {
  position: absolute;

  z-index: 10;

  left: 13px;
  right: 13px;
  bottom: 12px;

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 9px;
}

.quick-card {
  min-height: 70px;

  padding: 9px;

  border: 0;

  border-radius: 18px;

  display: flex;
  align-items: center;

  gap: 9px;

  text-align: left;

  background:
    rgba(
      255,
      255,
      255,
      0.95
    );

  box-shadow:
    0 10px 25px
    rgba(
      49,
      104,
      154,
      0.14
    );
}

.quick-card > span:last-child {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.quick-card strong {
  color: #0d2c60;

  font-size: 11px;
  font-weight: 900;
}

.quick-card small {
  margin-top: 2px;

  color: #7487a4;

  font-size: 8px;
}

.quick-icon {
  width: 41px;
  height: 41px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 13px;

  color: white;
}

.quick-icon ion-icon {
  font-size: 20px;
}

.lost-action {
  background:
    linear-gradient(
      145deg,
      #4ba6ff,
      #1768e7
    );
}

.found-action {
  background:
    linear-gradient(
      145deg,
      #24c7c0,
      #07898f
    );
}

/* =========================================================
   SEARCH
========================================================= */

.home-search-row {
  margin-top: 15px;

  display: grid;

  grid-template-columns:
    1fr 50px;

  gap: 9px;
}

.search-box,
.records-search {
  min-height: 51px;

  padding:
    0 15px;

  border:
    1px solid
    #dfeaf4;

  border-radius: 17px;

  display: flex;
  align-items: center;

  gap: 9px;

  background:
    rgba(
      255,
      255,
      255,
      0.93
    );

  box-shadow:
    0 7px 20px
    rgba(
      51,
      100,
      150,
      0.06
    );
}

.search-box ion-icon,
.records-search ion-icon {
  flex-shrink: 0;

  color: #173d72;

  font-size: 19px;
}

.search-box input,
.records-search input {
  width: 100%;

  border: 0;
  outline: 0;

  color: #18345d;

  background: transparent;

  font-size: 11px;
}

.search-box input::placeholder,
.records-search input::placeholder {
  color: #8fa2ba;
}

.filter-button {
  border:
    1px solid
    #dfeaf4;

  border-radius: 16px;

  display: grid;
  place-items: center;

  color: #173d72;

  background: white;
}

/* =========================================================
   STATS
========================================================= */

.stats-grid {
  margin-top: 14px;

  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 7px;
}

.stat-card {
  min-width: 0;

  padding:
    11px 7px;

  border:
    1px solid
    #e2ecf5;

  border-radius: 16px;

  display: flex;
  flex-direction: column;

  background:
    rgba(
      255,
      255,
      255,
      0.85
    );
}

.stat-icon {
  width: 29px;
  height: 29px;

  margin-bottom: 7px;

  border-radius: 9px;

  display: grid;
  place-items: center;
}

.total-icon {
  color: #1479e9;
  background: #e1f1ff;
}

.lost-icon {
  color: #d52d4e;
  background: #ffe5ec;
}

.found-icon {
  color: #078b8d;
  background: #dff8f5;
}

.claimed-icon {
  color: #7056dc;
  background: #eee9ff;
}

.stat-card strong {
  color: #0d2855;

  font-size: 17px;
  font-weight: 950;
}

.stat-card small {
  margin-top: 2px;

  color: #687f9f;

  font-size: 8px;
}

/* =========================================================
   SECTION HEADER
========================================================= */

.section-header,
.records-header {
  margin:
    22px 2px
    11px;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-header h2,
.records-header h2 {
  margin: 0;

  color: #0d2a59;

  font-size: 17px;
  font-weight: 950;
}

.section-header button {
  border: 0;

  display: flex;
  align-items: center;

  gap: 3px;

  color: #0c68d6;

  background: transparent;

  font-size: 10px;
  font-weight: 800;
}

/* =========================================================
   RECENT
========================================================= */

.recent-list,
.records-list {
  display: grid;

  gap: 9px;
}

.recent-item {
  padding: 10px;

  border:
    1px solid
    #e4edf5;

  border-radius: 17px;

  display: grid;

  grid-template-columns:
    52px
    minmax(0, 1fr)
    auto;

  align-items: center;

  gap: 9px;

  background:
    rgba(
      255,
      255,
      255,
      0.94
    );
}

.item-thumbnail,
.record-thumbnail {
  display: grid;
  place-items: center;

  border-radius: 13px;

  color: #365470;
}

.item-thumbnail {
  width: 52px;
  height: 52px;
}

.item-thumbnail ion-icon,
.record-thumbnail ion-icon {
  font-size: 26px;
}

.lost-thumbnail {
  background:
    linear-gradient(
      145deg,
      #f0f2f4,
      #d8dee4
    );
}

.found-thumbnail {
  background:
    linear-gradient(
      145deg,
      #e4f6ff,
      #d6eefb
    );
}

.recent-information {
  min-width: 0;
}

.recent-title {
  display: flex;
  align-items: center;

  gap: 6px;
}

.recent-title h3 {
  overflow: hidden;

  margin: 0;

  color: #102b59;

  font-size: 11px;
  font-weight: 900;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.meta-information {
  margin-top: 5px;

  display: flex;
  flex-direction: column;

  gap: 3px;
}

.meta-information span {
  display: flex;
  align-items: center;

  gap: 4px;

  color: #667d9e;

  font-size: 8px;
}

/* =========================================================
   BADGES
========================================================= */

.badge {
  width: fit-content;

  padding:
    5px 9px;

  border-radius: 999px;

  font-size: 8px;
  font-weight: 850;

  white-space: nowrap;
}

.lost-badge {
  color: #d12945;
  background: #ffe4e8;
}

.found-badge {
  color: #1465c3;
  background: #dcecff;
}

.unclaimed-badge {
  color: #946600;
  background: #fff0b9;
}

.claimed-badge {
  color: #067868;
  background: #ccf6eb;
}

/* =========================================================
   EMPTY / LOADING
========================================================= */

.state-card {
  min-height: 180px;

  padding: 24px;

  border:
    1px solid
    #e1ebf4;

  border-radius: 21px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  text-align: center;

  color: #6c819e;

  background:
    rgba(
      255,
      255,
      255,
      0.84
    );
}

.state-icon {
  width: 54px;
  height: 54px;

  margin-bottom: 10px;

  border-radius: 16px;

  display: grid;
  place-items: center;

  color: #1475e3;

  background: #e4f2ff;
}

.state-icon ion-icon {
  font-size: 26px;
}

.state-card h3 {
  margin: 0;

  color: #112e5d;

  font-size: 16px;
}

.state-card p {
  margin:
    6px 0
    13px;

  color: #7186a2;

  font-size: 10px;
}

.small-primary-button {
  padding:
    10px 15px;

  border: 0;

  border-radius: 11px;

  color: white;

  background:
    linear-gradient(
      135deg,
      #328cf5,
      #0864e5
    );

  font-size: 10px;
  font-weight: 800;
}

/* =========================================================
   FORM
========================================================= */

.form-screen {
  max-width: 590px;

  margin: auto;
}

.stepper {
  margin:
    2px 10px
    16px;

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);
}

.step {
  text-align: center;

  color: #8ca0bc;
}

.step-number {
  width: 30px;
  height: 30px;

  margin: auto;

  border:
    2px solid
    #d7e5f2;

  border-radius: 50%;

  display: grid;
  place-items: center;

  color: #7290b6;

  background: white;

  font-size: 11px;
  font-weight: 900;
}

.step.active {
  color: #0d65d4;
}

.step.active .step-number {
  border-color: #1977ed;

  color: white;

  background:
    linear-gradient(
      145deg,
      #3b9aff,
      #0869e8
    );
}

.step small {
  display: block;

  margin-top: 5px;

  font-size: 8px;
  font-weight: 800;
}

.form-card {
  padding: 17px;

  border:
    1px solid
    #dfebf5;

  border-radius: 24px;

  background:
    rgba(
      255,
      255,
      255,
      0.93
    );

  box-shadow:
    0 15px 38px
    rgba(
      52,
      105,
      154,
      0.09
    );
}

/* =========================================================
   PHOTO UPLOAD
========================================================= */

.photo-upload {
  min-height: 112px;

  margin-bottom: 18px;

  padding: 14px;

  position: relative;

  overflow: hidden;

  border:
    1.5px dashed
    #9fc8eb;

  border-radius: 18px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  cursor: pointer;

  text-align: center;

  background:
    linear-gradient(
      145deg,
      #fbfdff,
      #f0f8ff
    );

  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.photo-upload:active {
  transform:
    scale(0.99);
}

.photo-upload:hover {
  border-color:
    #438fe1;

  box-shadow:
    0 8px 22px
    rgba(
      33,
      126,
      225,
      0.1
    );
}

.photo-input {
  display: none;
}

.camera-icon {
  margin-bottom: 6px;

  color: #0871df;

  font-size: 27px;
}

.photo-upload strong {
  color: #112e5c;

  font-size: 12px;
}

.photo-upload > span {
  margin-top: 2px;

  color: #0e72df;

  font-size: 9px;
}

.photo-upload > p {
  margin:
    4px 0 0;

  color: #8395ad;

  font-size: 8px;
}

.photo-upload.has-photo {
  height: 200px;

  padding: 0;

  border-style: solid;

  border-color:
    #b9d8f5;

  background:
    #eaf5ff;
}

.photo-preview {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;
}

.photo-overlay {
  position: absolute;

  left: 50%;
  bottom: 12px;

  transform:
    translateX(-50%);

  padding:
    8px 13px;

  border-radius: 999px;

  display: flex;
  align-items: center;

  gap: 6px;

  color: white;

  background:
    rgba(
      12,
      43,
      80,
      0.8
    );

  backdrop-filter:
    blur(10px);

  font-size: 9px;
  font-weight: 800;

  white-space: nowrap;
}

.photo-overlay ion-icon {
  font-size: 15px;
}

.remove-photo-button {
  margin:
    -8px auto
    18px;

  padding:
    8px 12px;

  border: 0;

  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 5px;

  color: #d83d4f;

  background: #fff0f2;

  font-size: 9px;
  font-weight: 800;
}

/* =========================================================
   FORM TITLE
========================================================= */

.form-title {
  margin-bottom: 17px;

  display: flex;
  align-items: center;

  gap: 9px;
}

.form-title-icon {
  width: 33px;
  height: 33px;

  flex-shrink: 0;

  border-radius: 10px;

  display: grid;
  place-items: center;

  color: #1674dd;

  background: #e3f2ff;
}

.form-title h2 {
  margin: 0;

  color: #102d5c;

  font-size: 16px;
  font-weight: 950;
}

.form-title p {
  margin:
    2px 0 0;

  color: #8394ac;

  font-size: 8px;
}

/* =========================================================
   FORM FIELDS
========================================================= */

.field {
  margin-bottom: 16px;

  position: relative;
}

.field label {
  display: block;

  margin-bottom: 7px;

  color: #17345e;

  font-size: 10px;
  font-weight: 850;
}

.field label span {
  color: #e1394e;
}

.field ion-input,
.field ion-textarea {
  --background: #fbfdff;
  --color: #18345d;

  --placeholder-color:
    #8da0ba;

  --border-color:
    #cfdeec;

  --border-radius:
    12px;

  --highlight-color-focused:
    #2181ed;

  --padding-start:
    13px;

  --padding-end:
    13px;

  font-size: 11px;
}

.field ion-input {
  min-height: 47px;
}

.field ion-textarea {
  min-height: 90px;
}

.character-count {
  display: block;

  margin-top: 4px;

  color: #879ab3;

  font-size: 8px;

  text-align: right;
}

/* =========================================================
   CHOICES
========================================================= */

.choice-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 8px;
}

.choice-card {
  min-height: 88px;

  padding: 12px;

  border:
    1.5px solid
    #e1ebf3;

  border-radius: 14px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  color: #29486f;

  background: #fbfdff;
}

.choice-card ion-icon {
  margin-bottom: 5px;

  font-size: 23px;
}

.choice-card strong {
  font-size: 12px;
}

.choice-card small {
  margin-top: 2px;

  color: #7588a4;

  font-size: 8px;
}

.lost-selected {
  border-color: #ff9fa9;

  color: #d82740;

  background: #fff1f3;
}

.found-selected {
  border-color: #72b9f7;

  color: #0c68ca;

  background: #ebf6ff;
}

.status-choice {
  min-height: 70px;

  padding: 9px;

  border:
    1.5px solid
    #e1ebf3;

  border-radius: 14px;

  display: flex;
  align-items: center;

  gap: 7px;

  color: #29486f;

  background: #fbfdff;

  text-align: left;
}

.status-choice ion-icon {
  flex-shrink: 0;

  font-size: 19px;
}

.status-choice div {
  display: flex;
  flex-direction: column;
}

.status-choice strong {
  font-size: 9px;
}

.status-choice small {
  margin-top: 2px;

  color: #7b8da7;

  font-size: 7px;
}

.unclaimed-selected {
  border-color: #efbd35;

  color: #946500;

  background: #fff9e7;
}

.claimed-selected {
  border-color: #48cdb4;

  color: #087767;

  background: #edfcf8;
}

/* =========================================================
   CUSTOM INPUT
========================================================= */

.custom-input {
  min-height: 49px;

  padding:
    0 12px;

  border:
    1px solid
    #cfdeec;

  border-radius: 13px;

  display: flex;
  align-items: center;

  gap: 7px;

  background: #fbfdff;
}

.custom-input > ion-icon {
  flex-shrink: 0;

  color: #5d789c;

  font-size: 17px;
}

.custom-input ion-input {
  --border-width: 0;
  --border-color: transparent;
  --background: transparent;

  min-height: 45px;
}

/* =========================================================
   BUTTONS
========================================================= */

.primary-button,
.secondary-button {
  min-height: 50px;

  padding:
    0 17px;

  border: 0;

  border-radius: 15px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  font-size: 11px;
  font-weight: 900;
}

.primary-button {
  width: 100%;

  color: white;

  background:
    linear-gradient(
      135deg,
      #3a94f8,
      #0764e7
    );

  box-shadow:
    0 10px 24px
    rgba(
      20,
      107,
      227,
      0.2
    );
}

.secondary-button {
  color: #315379;

  background: #eef5fb;
}

.navigation-buttons {
  margin-top: 8px;

  display: grid;

  grid-template-columns:
    0.7fr 1.3fr;

  gap: 8px;
}

/* =========================================================
   REVIEW
========================================================= */

.review-card {
  margin-bottom: 17px;

  padding: 18px;

  border:
    1px solid
    #dce9f4;

  border-radius: 19px;

  text-align: center;

  background:
    linear-gradient(
      145deg,
      #f9fcff,
      #eff8ff
    );
}

.review-photo {
  width: 100%;
  height: 190px;

  margin-bottom: 14px;

  border-radius: 16px;

  object-fit: cover;
}

.review-placeholder {
  width: 64px;
  height: 64px;

  margin:
    0 auto
    10px;

  border-radius: 19px;

  display: grid;
  place-items: center;

  color: #1974db;

  background: #dfefff;
}

.review-placeholder ion-icon {
  font-size: 30px;
}

.review-card h2 {
  margin: 0;

  color: #102d5a;

  font-size: 19px;
}

.review-badges {
  margin: 9px 0;

  display: flex;
  justify-content: center;

  gap: 6px;
}

.review-card > p {
  color: #637a99;

  font-size: 10px;

  line-height: 1.5;
}

.review-information {
  padding-top: 11px;

  border-top:
    1px solid
    #dae7f2;

  display: flex;
  flex-direction: column;

  gap: 5px;

  color: #526f94;

  font-size: 9px;
}

.review-information span {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 5px;
}

/* =========================================================
   RECORDS
========================================================= */

.records-search {
  width: 100%;

  margin-bottom: 12px;
}

.filter-chips {
  display: flex;

  gap: 6px;

  overflow-x: auto;

  padding-bottom: 6px;

  scrollbar-width: none;
}

.filter-chips::-webkit-scrollbar {
  display: none;
}

.filter-chips button {
  min-height: 34px;

  flex-shrink: 0;

  padding:
    0 15px;

  border:
    1px solid
    #dce8f3;

  border-radius: 12px;

  color: #315078;

  background: white;

  font-size: 9px;
  font-weight: 800;
}

.filter-chips button.active {
  border-color: #1474e6;

  color: white;

  background:
    linear-gradient(
      145deg,
      #318cf5,
      #0966e6
    );
}

.records-header p {
  margin:
    2px 0 0;

  color: #8496ae;

  font-size: 8px;
}

.refresh-button {
  width: 37px;
  height: 37px;

  border:
    1px solid
    #d9e6f2;

  border-radius: 11px;

  display: grid;
  place-items: center;

  color: #176fd2;

  background: white;
}

.record-card {
  position: relative;

  padding: 10px;

  border:
    1px solid
    #e1ebf4;

  border-radius: 18px;

  display: grid;

  grid-template-columns:
    58px
    minmax(0, 1fr)
    auto
    30px;

  gap: 9px;

  background:
    rgba(
      255,
      255,
      255,
      0.94
    );
}

.record-thumbnail {
  width: 58px;
  height: 58px;
}

.record-main {
  min-width: 0;
}

.record-main h3 {
  overflow: hidden;

  margin:
    2px 0
    5px;

  color: #102d59;

  font-size: 12px;
  font-weight: 900;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.record-main span {
  margin-top: 2px;

  display: flex;
  align-items: center;

  gap: 3px;

  color: #627a9b;

  font-size: 8px;
}

.record-main p {
  overflow: hidden;

  margin:
    6px 0 0;

  color: #7a8ca5;

  font-size: 8px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.record-badges {
  display: flex;
  flex-direction: column;

  gap: 5px;
}

.menu-wrapper {
  position: relative;
}

.menu-button {
  width: 30px;
  height: 35px;

  border:
    1px solid
    #e5edf5;

  border-radius: 10px;

  display: grid;
  place-items: center;

  color: #426186;

  background: white;
}

.item-menu {
  min-width: 120px;

  position: absolute;

  z-index: 50;

  top: 39px;
  right: 0;

  padding: 5px;

  border:
    1px solid
    #dfe9f2;

  border-radius: 12px;

  background: white;

  box-shadow:
    0 14px 32px
    rgba(
      35,
      70,
      105,
      0.17
    );
}

.item-menu button {
  width: 100%;

  padding: 9px;

  border: 0;

  border-radius: 8px;

  display: flex;
  align-items: center;

  gap: 6px;

  color: #365577;

  background: transparent;

  font-size: 9px;
  font-weight: 800;

  text-align: left;
}

.item-menu .delete-option {
  color: #d83d4f;
}

/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

.bottom-nav {
  width:
    min(
      100%,
      720px
    );

  height:
    calc(
      76px +
      env(
        safe-area-inset-bottom
      )
    );

  position: fixed;

  z-index: 1000;

  left: 50%;
  bottom: 0;

  transform:
    translateX(-50%);

  padding:
    8px
    34px
    calc(
      7px +
      env(
        safe-area-inset-bottom
      )
    );

  border:
    1px solid
    rgba(
      216,
      230,
      242,
      0.9
    );

  border-bottom: 0;

  border-radius:
    24px
    24px
    0
    0;

  display: grid;

  grid-template-columns:
    1fr
    80px
    1fr;

  align-items: center;

  background:
    rgba(
      255,
      255,
      255,
      0.95
    );

  backdrop-filter:
    blur(22px);

  box-shadow:
    0 -8px 28px
    rgba(
      44,
      87,
      128,
      0.09
    );
}

.nav-button {
  height: 54px;

  border: 0;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 3px;

  color: #557394;

  background: transparent;
}

.nav-button ion-icon {
  font-size: 22px;
}

.nav-button span {
  font-size: 8px;
  font-weight: 800;
}

.nav-button.active {
  color: #086be5;
}

.add-button {
  width: 61px;
  height: 61px;

  margin:
    -33px auto
    0;

  border:
    6px solid
    #edf7ff;

  border-radius: 50%;

  display: grid;
  place-items: center;

  color: white;

  background:
    linear-gradient(
      145deg,
      #3594fa,
      #0865e7
    );

  box-shadow:
    0 10px 24px
    rgba(
      20,
      106,
      226,
      0.27
    );
}

.add-button ion-icon {
  font-size: 30px;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 480px) {
  .header-content {
    width:
      calc(
        100% - 20px
      );
  }

  .brand-logo {
    width: 41px;
    height: 41px;
  }

  .brand h1,
  .form-header h1 {
    font-size: 16px;
  }

  .app-container {
    width:
      calc(
        100% - 18px
      );

    padding-top: 9px;
  }

  .hero-card {
    min-height: 305px;

    padding:
      24px
      17px
      85px;

    border-radius: 24px;
  }

  .hero-content {
    width: 68%;
  }

  .hero-content h2 {
    font-size: 24px;
  }

  .hero-content p {
    font-size: 10px;
  }

  .hero-visual {
    right: 0;

    transform:
      scale(0.86);

    transform-origin:
      bottom right;
  }

  .quick-actions {
    left: 10px;
    right: 10px;
    bottom: 10px;
  }

  .quick-card {
    min-height: 65px;

    padding: 7px;
  }

  .quick-icon {
    width: 38px;
    height: 38px;
  }

  .stats-grid {
    gap: 5px;
  }

  .stat-card {
    padding:
      10px 5px;
  }

  .record-card {
    grid-template-columns:
      53px
      minmax(0, 1fr)
      29px;
  }

  .record-thumbnail {
    width: 53px;
    height: 53px;
  }

  .record-badges {
    grid-column: 2;

    flex-direction: row;
  }

  .menu-wrapper {
    grid-column: 3;
    grid-row: 1;
  }

  .bottom-nav {
    padding-left: 25px;
    padding-right: 25px;
  }
}

/* =========================================================
   VERY SMALL PHONE
========================================================= */

@media (max-width: 350px) {
  .hero-content h2 {
    font-size: 21px;
  }

  .hero-visual {
    transform:
      scale(0.72);

    opacity: 0.85;
  }

  .quick-card small {
    display: none;
  }

  .stats-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .choice-grid {
    grid-template-columns:
      1fr;
  }
}


/* =========================================================
   FINAL MOBILE READABILITY + FILTER PANEL
========================================================= */
.record-filter-panel {
  position: fixed;
  z-index: 3000;
  top: 72px;
  right: max(14px, calc((100vw - 720px) / 2 + 14px));
  width: min(360px, calc(100vw - 28px));
  padding: 16px;
  border: 1px solid #dce9f4;
  border-radius: 20px;
  background: rgba(255,255,255,.98);
  box-shadow: 0 20px 50px rgba(34,73,112,.20);
  backdrop-filter: blur(20px);
}
.filter-panel-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:15px; }
.filter-panel-header h3 { margin:0; color:#102d5c; font-size:17px; font-weight:950; }
.filter-panel-header p { margin:3px 0 0; color:#7186a2; font-size:11px; }
.filter-close-button { width:32px; height:32px; border:0; border-radius:10px; color:#476687; background:#eef5fb; font-size:22px; line-height:1; }
.filter-panel-section { margin-top:13px; }
.filter-panel-section > strong { display:block; margin-bottom:8px; color:#17345e; font-size:12px; }
.filter-panel-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; }
.filter-panel-grid.two-column { grid-template-columns:1fr 1fr; }
.filter-panel-grid button { min-height:38px; padding:7px 8px; border:1px solid #dce8f3; border-radius:11px; color:#315078; background:#f9fcff; font-size:10px; font-weight:800; }
.filter-panel-grid button.active { border-color:#1474e6; color:#fff; background:linear-gradient(145deg,#318cf5,#0966e6); }
.apply-filter-button { width:100%; min-height:43px; margin-top:16px; border:0; border-radius:13px; color:#fff; background:linear-gradient(135deg,#3a94f8,#0764e7); font-size:12px; font-weight:900; }

/* Slightly larger text for real-phone readability */
.brand p, .form-header p { font-size:12px; }
.hero-content p { font-size:13px; }
.quick-card strong { font-size:13px; }
.quick-card small { font-size:10px; }
.search-box input, .records-search input { font-size:13px; }
.stat-card small { font-size:10px; }
.section-header button { font-size:11px; }
.recent-title h3 { font-size:13px; }
.meta-information span { font-size:10px; }
.badge { font-size:9px; }
.records-header p { font-size:10px; }
.filter-chips button { font-size:11px; }
.record-main h3 { font-size:13px; }
.record-main span, .record-main p { font-size:10px; }
.step small { font-size:10px; }
.photo-upload strong { font-size:14px; }
.photo-upload > span { font-size:11px; }
.photo-upload > p { font-size:10px; }
.form-title p { font-size:10px; }
.field label { font-size:12px; }
.field ion-input, .field ion-textarea { font-size:13px; }
.character-count { font-size:10px; }
.choice-card strong { font-size:13px; }
.choice-card small { font-size:10px; }
.status-choice strong { font-size:11px; }
.status-choice small { font-size:9px; }
.primary-button, .secondary-button { font-size:12px; }
.review-card > p { font-size:11px; }
.review-information { font-size:10px; }
.notification-panel-header h3 { font-size:17px; }
.notification-panel-header p { font-size:10px; }
.mark-read-button { font-size:9px; }
.notification-copy strong { font-size:12px; }
.notification-copy > span { font-size:10px; }
.notification-copy small { font-size:9px; }
.notification-empty strong { font-size:13px; }
.notification-empty span { font-size:10px; }

@media (max-width: 480px) {
  .brand h1, .form-header h1 { font-size:18px; }
  .hero-content h2 { font-size:26px; }
  .hero-content p { font-size:12px; }
  .quick-card strong { font-size:12px; }
  .quick-card small { display:block; font-size:9px; }
  .record-filter-panel { top:74px; right:10px; width:calc(100vw - 20px); }
}

</style>