<script setup lang="ts">
interface Account {
  id: string
  name: string
  icon?: string | null
  color?: string | null
  isMain: boolean
  createdAt: string
}

interface Transaction {
  id: string
  name: string
  amount: string
  accountId: string
  type: 'income' | 'expense'
  frequency: 'once' | 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate?: string | null
  account?: Account
}



interface Profile {
  id: string
  name: string
  email: string
  onboarded: boolean
  createdAt: string
}

definePageMeta({ layout: false })

const toast = useToast()
const user = useSupabaseUser()
const onboardedStateMap = useState<Record<string, boolean>>('users-onboarded-map', () => ({}))

const currentStep = ref(1)

// --- Données créées par l'utilisateur ---
const accounts = ref<Account[]>([])
const transactions = ref<Transaction[]>([])

const incomes = computed(() => transactions.value.filter(t => t.type === 'income'))
const expenses = computed(() => transactions.value.filter(t => t.type === 'expense'))

// --- États de chargement ---
const loadingAccounts = ref(false)
const loadingTransactions = ref(false)

const submitting = ref(false)

// --- États des formulaires ---
const accountForm = reactive({
  name: '',
  icon: 'i-heroicons-building-library',
  color: 'emerald' // Couleur par défaut fixée
})

const incomeForm = reactive({
  name: '',
  amount: undefined as number | undefined,
  accountId: '',
  frequency: 'monthly' as 'once' | 'monthly' | 'quarterly' | 'yearly',
  startDate: new Date().toISOString().substring(0, 10)
})

const expenseForm = reactive({
  name: '',
  amount: undefined as number | undefined,
  accountId: '',
  frequency: 'monthly' as 'once' | 'monthly' | 'quarterly' | 'yearly',
  startDate: new Date().toISOString().substring(0, 10)
})

// --- Options pour les sélecteurs ---
const icons = [
  { label: 'Banque', value: 'i-heroicons-building-library' },
  { label: 'Carte de crédit', value: 'i-heroicons-credit-card' },
  { label: 'Billets', value: 'i-heroicons-banknotes' },
  { label: 'Portefeuille', value: 'i-heroicons-wallet' },
  { label: 'Diplôme', value: 'i-heroicons-academic-cap' },
  { label: 'Mallette', value: 'i-heroicons-briefcase' }
]

const frequencies = [
  { label: 'Ponctuel', value: 'once' },
  { label: 'Mensuel', value: 'monthly' },
  { label: 'Trimestriel', value: 'quarterly' },
  { label: 'Annuel', value: 'yearly' }
]

// --- Récupération des données ---
async function fetchAccounts() {
  loadingAccounts.value = true
  try {
    const res = await $fetch<Account[]>('/api/accounts')
    accounts.value = res || []
    if (accounts.value.length > 0) {
      const mainAcc = accounts.value.find(a => a.isMain) || accounts.value[0]
      if (mainAcc) {
        if (!incomeForm.accountId) incomeForm.accountId = mainAcc.id
        if (!expenseForm.accountId) expenseForm.accountId = mainAcc.id
      }
    }
  } catch (err) {
    console.error('Erreur lors du chargement des comptes:', err)
  } finally {
    loadingAccounts.value = false
  }
}

async function fetchTransactions() {
  loadingTransactions.value = true
  try {
    const res = await $fetch<Transaction[]>('/api/transactions')
    transactions.value = res || []
  } catch (err) {
    console.error('Erreur lors du chargement des transactions:', err)
  } finally {
    loadingTransactions.value = false
  }
}

// --- Méthodes de création et suppression ---
async function handleCreateAccount() {
  if (!accountForm.name.trim()) return
  submitting.value = true
  try {
    await $fetch('/api/accounts', {
      method: 'POST',
      body: {
        name: accountForm.name,
        icon: accountForm.icon,
        color: accountForm.color
      }
    })
    accountForm.name = ''
    toast.add({ title: 'Compte bancaire créé !', color: 'success' })
    await fetchAccounts()
  } catch (err: unknown) {
    const errorData = err as { data?: { message?: string } }
    toast.add({ title: 'Erreur', description: errorData.data?.message || 'Impossible de créer le compte', color: 'error' })
  } finally {
    submitting.value = false
  }
}

async function handleDeleteAccount(id: string) {
  try {
    await $fetch(`/api/accounts/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Compte supprimé', color: 'success' })
    await fetchAccounts()
  } catch (err: unknown) {
    const errorData = err as { data?: { message?: string } }
    toast.add({ title: 'Erreur', description: errorData.data?.message || 'Impossible de supprimer le compte', color: 'error' })
  }
}

async function handleCreateIncome() {
  if (!incomeForm.name.trim() || !incomeForm.amount || !incomeForm.accountId) return
  submitting.value = true
  try {
    const startIso = new Date(incomeForm.startDate).toISOString()
    await $fetch('/api/transactions', {
      method: 'POST',
      body: {
        name: incomeForm.name,
        amount: Number(incomeForm.amount),
        accountId: incomeForm.accountId,
        type: 'income',
        frequency: incomeForm.frequency,
        startDate: startIso
      }
    })
    incomeForm.name = ''
    incomeForm.amount = undefined
    toast.add({ title: 'Revenu ajouté !', color: 'success' })
    await fetchTransactions()
  } catch (err: unknown) {
    const errorData = err as { data?: { message?: string } }
    toast.add({ title: 'Erreur', description: errorData.data?.message || 'Impossible d\'ajouter le revenu', color: 'error' })
  } finally {
    submitting.value = false
  }
}

async function handleCreateExpense() {
  if (!expenseForm.name.trim() || !expenseForm.amount || !expenseForm.accountId) return
  submitting.value = true
  try {
    const startIso = new Date(expenseForm.startDate).toISOString()
    await $fetch('/api/transactions', {
      method: 'POST',
      body: {
        name: expenseForm.name,
        amount: Number(expenseForm.amount),
        accountId: expenseForm.accountId,
        type: 'expense',
        frequency: expenseForm.frequency,
        startDate: startIso
      }
    })
    expenseForm.name = ''
    expenseForm.amount = undefined
    toast.add({ title: 'Dépense ajoutée !', color: 'success' })
    await fetchTransactions()
  } catch (err: unknown) {
    const errorData = err as { data?: { message?: string } }
    toast.add({ title: 'Erreur', description: errorData.data?.message || 'Impossible d\'ajouter la dépense', color: 'error' })
  } finally {
    submitting.value = false
  }
}

async function handleDeleteTransaction(id: string) {
  try {
    await $fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Transaction supprimée', color: 'success' })
    await fetchTransactions()
  } catch (err: unknown) {
    const errorData = err as { data?: { message?: string } }
    toast.add({ title: 'Erreur', description: errorData.data?.message || 'Impossible de supprimer la transaction', color: 'error' })
  }
}

// --- Navigation ---
const goToStep = (step: number) => {
  currentStep.value = step
}

const goToNextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    handleComplete()
  }
}

const goToPrevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

async function handleComplete() {
  try {
    await $fetch('/api/profile/complete-onboarding', { method: 'POST' })
    if (user.value) {
      onboardedStateMap.value[user.value.id] = true
    }
    toast.add({ title: 'Onboarding terminé avec succès !', color: 'success' })
    // Redirection vers les flux mensuels
    navigateTo('/dashboard/flows')
  } catch (err) {
    console.error('Erreur complétion onboarding:', err)
    toast.add({ title: 'Erreur', description: 'Impossible de terminer l\'onboarding', color: 'error' })
  }
}

async function handleSkip() {
  try {
    await $fetch('/api/profile/complete-onboarding', { method: 'POST' })
    if (user.value) {
      onboardedStateMap.value[user.value.id] = true
    }
    toast.add({ title: 'Onboarding ignoré', color: 'neutral' })
    navigateTo('/dashboard')
  } catch (err) {
    console.error('Erreur lors du skip de l\'onboarding:', err)
  }
}

// --- Initialisation ---
onMounted(async () => {
  if (!user.value) {
    navigateTo('/login')
    return
  }

  const uid = user.value.id
  if (onboardedStateMap.value[uid] === undefined) {
    try {
      const profile = await $fetch<Profile>('/api/profile')
      onboardedStateMap.value[uid] = profile.onboarded
    } catch (e) {
      console.error(e)
    }
  }

  if (onboardedStateMap.value[uid] === true) {
    navigateTo('/dashboard')
    return
  }

  await Promise.all([
    fetchAccounts(),
    fetchTransactions()
  ])
})
</script>

<template>
  <div class="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50 dark:bg-[#0A332C] font-sans">
    <!-- Colonne gauche : Stepper et Pédagogie (Clic navigable) -->
    <div class="md:w-2/5 lg:w-1/3 bg-radial from-[#155A4C] to-[#0C3C32] text-white p-8 md:p-12 flex flex-col justify-between shadow-2xl z-10 h-full overflow-y-auto">
      <div class="space-y-12">
        <div class="flex items-center gap-2">
          <AppLogo class="h-8 w-auto filter invert brightness-0" />
        </div>

        <div>
          <h1 class="text-3xl font-extrabold tracking-tight">
            Onboarding
          </h1>
          <p class="text-emerald-200 mt-2 text-sm leading-relaxed">
            Configurez votre espace financier en 3 étapes simples et commencez à maîtriser vos flux.
          </p>
        </div>

        <!-- Stepper Visuel Interactif -->
        <nav class="relative space-y-6">
          <div class="absolute left-4 top-2 bottom-2 w-0.5 bg-emerald-800/40 z-0" />

          <!-- Étape 1 -->
          <div
            class="flex items-start gap-4 relative z-10 transition-all duration-300 cursor-pointer hover:bg-white/5 p-2 rounded-lg -ml-2"
            :class="currentStep === 1 ? 'scale-105' : 'opacity-60'"
            @click="goToStep(1)"
          >
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300"
              :class="currentStep >= 1 ? 'bg-white text-[#0C3C32] border-white' : 'bg-emerald-900 border-emerald-700 text-emerald-300'"
            >
              1
            </div>
            <div>
              <p class="font-bold text-sm">
                Comptes bancaires
              </p>
              <p class="text-xs text-emerald-200 mt-0.5">
                Ajoutez vos comptes d'épargne ou courants.
              </p>
            </div>
          </div>

          <!-- Étape 2 -->
          <div
            class="flex items-start gap-4 relative z-10 transition-all duration-300 cursor-pointer hover:bg-white/5 p-2 rounded-lg -ml-2"
            :class="currentStep === 2 ? 'scale-105' : 'opacity-60'"
            @click="goToStep(2)"
          >
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300"
              :class="currentStep >= 2 ? 'bg-white text-[#0C3C32] border-white' : 'bg-emerald-900 border-emerald-700 text-emerald-300'"
            >
              2
            </div>
            <div>
              <p class="font-bold text-sm">
                Revenus récurrents
              </p>
              <p class="text-xs text-emerald-200 mt-0.5">
                Saisissez vos salaires ou autres rentrées.
              </p>
            </div>
          </div>

          <!-- Étape 3 -->
          <div
            class="flex items-start gap-4 relative z-10 transition-all duration-300 cursor-pointer hover:bg-white/5 p-2 rounded-lg -ml-2"
            :class="currentStep === 3 ? 'scale-105' : 'opacity-60'"
            @click="goToStep(3)"
          >
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300"
              :class="currentStep >= 3 ? 'bg-white text-[#0C3C32] border-white' : 'bg-emerald-900 border-emerald-700 text-emerald-300'"
            >
              3
            </div>
            <div>
              <p class="font-bold text-sm">
                Dépenses habituelles
              </p>
              <p class="text-xs text-emerald-200 mt-0.5">
                Loyer, abonnements, factures courantes.
              </p>
            </div>
          </div>
        </nav>
      </div>

      <!-- Bouton Passer l'onboarding (Intégré dans le texte d'explication) -->
      <div class="mt-8 md:mt-0 flex flex-col gap-3 border-t border-emerald-800/40 pt-4">
        <p class="text-[11px] text-emerald-200/80 leading-relaxed">
          <button
            type="button"
            class="text-red-300 hover:text-red-200 underline decoration-red-300/30 hover:decoration-red-200 cursor-pointer transition-colors font-semibold mr-1 inline-block"
            @click="handleSkip"
          >
            Passer l'onboarding.
          </button>
          Vous pourrez relancer ce guide à tout moment depuis vos Paramètres.
        </p>

        <div class="flex items-center justify-between text-xs text-emerald-300 border-t border-emerald-800/40 pt-3">
          <span>Aiesura © {{ new Date().getFullYear() }}</span>
          <UColorModeButton class="text-white hover:bg-white/10" />
        </div>
      </div>
    </div>

    <!-- Colonne droite : Formulaires interactifs (Non-scrollable globalement, listes scrollables) -->
    <div class="flex-1 p-6 md:p-12 lg:p-16 flex flex-col justify-between max-w-4xl mx-auto w-full h-full overflow-hidden">
      <div class="space-y-8 flex-grow flex flex-col justify-start overflow-hidden">
        <!-- HEADER DE L'ÉTAPE COURANTE -->
        <div class="space-y-2 flex-shrink-0">
          <UBadge
            color="success"
            variant="soft"
            size="lg"
          >
            Étape {{ currentStep }} sur 3
          </UBadge>
          <h2
            v-if="currentStep === 1"
            class="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white"
          >
            Créez vos comptes financiers
          </h2>
          <h2
            v-else-if="currentStep === 2"
            class="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white"
          >
            Ajoutez vos revenus récurrents
          </h2>
          <h2
            v-else-if="currentStep === 3"
            class="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white"
          >
            Indiquez vos dépenses périodiques
          </h2>

          <p class="text-gray-600 dark:text-gray-400 text-sm">
            <span v-if="currentStep === 1">Créez au moins un compte bancaire (ex: Compte Courant, Épargne). C'est sur ces comptes que seront imputés vos flux.</span>
            <span v-else-if="currentStep === 2">Enregistrez vos salaires, aides ou autres rentrées régulières pour planifier votre mois.</span>
            <span v-else-if="currentStep === 3">Saisissez les charges fixes : loyer, électricité, internet, abonnements.</span>
          </p>
        </div>

        <!-- ZONE D'INTERACTION ACTIVE -->
        <div class="space-y-6 flex-grow flex flex-col overflow-hidden">
          <!-- ÉTAPE 1 : COMPTES -->
          <div
            v-if="currentStep === 1"
            class="space-y-6 flex-grow flex flex-col overflow-hidden"
          >
            <UCard class="bg-[#F1F5F3] dark:bg-[#0C3C32] border-0 flex-shrink-0">
              <form
                class="flex flex-col sm:flex-row items-end gap-4"
                @submit.prevent="handleCreateAccount"
              >
                <UFormField
                  label="Nom du compte"
                  name="accountName"
                  class="flex-grow w-full sm:w-auto"
                >
                  <UInput
                    v-model="accountForm.name"
                    placeholder="ex: Compte Courant SG"
                    required
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  label="Icône"
                  name="accountIcon"
                  class="w-full sm:w-48"
                >
                  <USelect
                    v-model="accountForm.icon"
                    :items="icons"
                    class="w-full"
                  />
                </UFormField>

                <UFormField class="w-full sm:w-auto">
                  <template #label>
                    <span class="opacity-0 select-none">-</span>
                  </template>
                  <UButton
                    type="submit"
                    icon="i-heroicons-plus"
                    color="primary"
                    :loading="submitting"
                    label="Ajouter"
                    size="md"
                    class="w-full sm:w-auto shrink-0 cursor-pointer"
                  />
                </UFormField>
              </form>
            </UCard>

            <!-- Liste des comptes existants (Scrollable) -->
            <div class="space-y-3 flex-grow flex flex-col overflow-hidden">
              <h3 class="font-bold text-sm text-gray-700 dark:text-gray-300 flex-shrink-0">
                Vos comptes bancaires créés ({{ accounts.length }})
              </h3>
              <div
                v-if="accounts.length === 0"
                class="text-sm text-gray-500 italic py-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg flex-shrink-0"
              >
                Aucun compte créé pour le moment.
              </div>
              <div
                v-else
                class="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[220px] pr-2 flex-grow"
              >
                <div
                  v-for="acc in accounts"
                  :key="acc.id"
                  class="p-4 bg-[#F1F5F3] dark:bg-[#0C3C32] rounded-lg flex items-center justify-between border border-emerald-950/10 dark:border-white/5"
                >
                  <div class="flex items-center gap-3">
                    <UIcon
                      :name="acc.icon || 'i-heroicons-building-library'"
                      class="w-6 h-6 flex-shrink-0 text-[#0A332C] dark:text-[#50E8A8]"
                    />
                    <div>
                      <p class="font-bold text-gray-800 dark:text-white text-sm">
                        {{ acc.name }}
                      </p>
                      <UBadge
                        v-if="acc.isMain"
                        color="warning"
                        variant="subtle"
                        size="xs"
                        class="mt-0.5"
                      >
                        Principal
                      </UBadge>
                    </div>
                  </div>
                  <UButton
                    color="error"
                    variant="ghost"
                    icon="i-heroicons-trash"
                    size="xs"
                    class="cursor-pointer"
                    @click="handleDeleteAccount(acc.id)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- ÉTAPE 2 : REVENUS -->
          <div
            v-else-if="currentStep === 2"
            class="space-y-6 flex-grow flex flex-col overflow-hidden"
          >
            <div
              v-if="accounts.length === 0"
              class="p-6 text-center border border-yellow-500/25 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg text-sm flex-shrink-0"
            >
              Vous devez créer au moins un compte bancaire à l'étape précédente pour pouvoir ajouter des revenus.
            </div>

            <template v-else>
              <UCard class="bg-[#F1F5F3] dark:bg-[#0C3C32] border-0 flex-shrink-0">
                <form
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end"
                  @submit.prevent="handleCreateIncome"
                >
                  <UFormField
                    label="Libellé du revenu"
                    name="incomeName"
                  >
                    <UInput
                      v-model="incomeForm.name"
                      placeholder="ex: Salaire, CAF, Loyer..."
                      required
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    label="Montant (€)"
                    name="incomeAmount"
                  >
                    <UInput
                      v-model="incomeForm.amount"
                      type="number"
                      step="0.01"
                      placeholder="ex: 1800"
                      required
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    label="Compte d'accueil"
                    name="incomeAccount"
                  >
                    <USelect
                      v-model="incomeForm.accountId"
                      :items="accounts.map(a => ({ label: a.name, value: a.id }))"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    label="Fréquence"
                    name="incomeFrequency"
                  >
                    <USelect
                      v-model="incomeForm.frequency"
                      :items="frequencies"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    label="Date de début"
                    name="incomeDate"
                  >
                    <UInput
                      v-model="incomeForm.startDate"
                      type="date"
                      required
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField class="w-full">
                    <template #label>
                      <span class="opacity-0 select-none">-</span>
                    </template>
                    <UButton
                      type="submit"
                      icon="i-heroicons-plus"
                      color="primary"
                      :loading="submitting"
                      label="Ajouter"
                      size="md"
                      class="w-full justify-center shrink-0 cursor-pointer"
                    />
                  </UFormField>
                </form>
              </UCard>

              <!-- Liste des revenus (Scrollable) -->
              <div class="space-y-3 flex-grow flex flex-col overflow-hidden">
                <h3 class="font-bold text-sm text-gray-700 dark:text-gray-300 flex-shrink-0">
                  Vos revenus enregistrés ({{ incomes.length }})
                </h3>
                <div
                  v-if="incomes.length === 0"
                  class="text-sm text-gray-500 italic py-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg flex-shrink-0"
                >
                  Aucun revenu enregistré.
                </div>
                <div
                  v-else
                  class="space-y-2 overflow-y-auto max-h-[220px] pr-2 flex-grow"
                >
                  <div
                    v-for="inc in incomes"
                    :key="inc.id"
                    class="p-4 bg-[#F1F5F3] dark:bg-[#0C3C32] rounded-lg flex items-center justify-between border border-emerald-950/10 dark:border-white/5"
                  >
                    <div class="flex items-center gap-3">
                      <UIcon
                        name="i-heroicons-arrow-trending-up"
                        class="w-6 h-6 flex-shrink-0 text-green-500"
                      />
                      <div>
                        <p class="font-bold text-gray-800 dark:text-white text-sm">
                          {{ inc.name }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          Reçu sur : <span class="font-semibold">{{ inc.account?.name }}</span> • {{ frequencies.find(f => f.value === inc.frequency)?.label }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="font-extrabold text-green-600 dark:text-green-400">+{{ inc.amount }} €</span>
                      <UButton
                        color="error"
                        variant="ghost"
                        icon="i-heroicons-trash"
                        size="xs"
                        class="cursor-pointer"
                        @click="handleDeleteTransaction(inc.id)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- ÉTAPE 3 : DÉPENSES -->
          <div
            v-else-if="currentStep === 3"
            class="space-y-6 flex-grow flex flex-col overflow-hidden"
          >
            <div
              v-if="accounts.length === 0"
              class="p-6 text-center border border-yellow-500/25 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg text-sm flex-shrink-0"
            >
              Vous devez créer au moins un compte bancaire à l'étape 1 pour pouvoir ajouter des dépenses.
            </div>

            <template v-else>
              <UCard class="bg-[#F1F5F3] dark:bg-[#0C3C32] border-0 flex-shrink-0">
                <form
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end"
                  @submit.prevent="handleCreateExpense"
                >
                  <UFormField
                    label="Libellé de la dépense"
                    name="expenseName"
                  >
                    <UInput
                      v-model="expenseForm.name"
                      placeholder="ex: Loyer, Netflix, EDF..."
                      required
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    label="Montant (€)"
                    name="expenseAmount"
                  >
                    <UInput
                      v-model="expenseForm.amount"
                      type="number"
                      step="0.01"
                      placeholder="ex: 650"
                      required
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    label="Compte de prélèvement"
                    name="expenseAccount"
                  >
                    <USelect
                      v-model="expenseForm.accountId"
                      :items="accounts.map(a => ({ label: a.name, value: a.id }))"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    label="Fréquence"
                    name="expenseFrequency"
                  >
                    <USelect
                      v-model="expenseForm.frequency"
                      :items="frequencies"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    label="Date de début"
                    name="expenseDate"
                  >
                    <UInput
                      v-model="expenseForm.startDate"
                      type="date"
                      required
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField class="w-full">
                    <template #label>
                      <span class="opacity-0 select-none">-</span>
                    </template>
                    <UButton
                      type="submit"
                      icon="i-heroicons-plus"
                      color="primary"
                      :loading="submitting"
                      label="Ajouter"
                      size="md"
                      class="w-full justify-center shrink-0 cursor-pointer"
                    />
                  </UFormField>
                </form>
              </UCard>

              <!-- Liste des dépenses (Scrollable) -->
              <div class="space-y-3 flex-grow flex flex-col overflow-hidden">
                <h3 class="font-bold text-sm text-gray-700 dark:text-gray-300 flex-shrink-0">
                  Vos dépenses enregistrées ({{ expenses.length }})
                </h3>
                <div
                  v-if="expenses.length === 0"
                  class="text-sm text-gray-500 italic py-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg flex-shrink-0"
                >
                  Aucune dépense enregistrée.
                </div>
                <div
                  v-else
                  class="space-y-2 overflow-y-auto max-h-[220px] pr-2 flex-grow"
                >
                  <div
                    v-for="exp in expenses"
                    :key="exp.id"
                    class="p-4 bg-[#F1F5F3] dark:bg-[#0C3C32] rounded-lg flex items-center justify-between border border-emerald-950/10 dark:border-white/5"
                  >
                    <div class="flex items-center gap-3">
                      <UIcon
                        name="i-heroicons-arrow-trending-down"
                        class="w-6 h-6 flex-shrink-0 text-red-500"
                      />
                      <div>
                        <p class="font-bold text-gray-800 dark:text-white text-sm">
                          {{ exp.name }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          Payé depuis : <span class="font-semibold">{{ exp.account?.name }}</span> • {{ frequencies.find(f => f.value === exp.frequency)?.label }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="font-extrabold text-red-600 dark:text-red-400">-{{ exp.amount }} €</span>
                      <UButton
                        color="error"
                        variant="ghost"
                        icon="i-heroicons-trash"
                        size="xs"
                        class="cursor-pointer"
                        @click="handleDeleteTransaction(exp.id)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- BOUTONS DE NAVIGATION DU BAS -->
          <div class="border-t border-gray-200 dark:border-gray-800 pt-6 mt-8 flex justify-between items-center bg-gray-50 dark:bg-[#0A332C] flex-shrink-0">
            <UButton
              v-if="currentStep > 1"
              color="primary"
              variant="outline"
              size="lg"
              icon="i-heroicons-arrow-left"
              label="Étape précédente"
              class="cursor-pointer text-[#0A332C] border-[#0A332C] hover:bg-[#0A332C]/10 dark:text-[#50E8A8] dark:border-[#50E8A8] dark:hover:bg-[#50E8A8]/10"
              @click="goToPrevStep"
            />
            <div v-else />

            <!-- Bouton Étape suivante / Terminer -->
            <UButton
              color="primary"
              variant="solid"
              size="lg"
              :trailing-icon="currentStep < 3 ? 'i-heroicons-arrow-right' : 'i-heroicons-check'"
              :label="currentStep < 3 ? 'Étape suivante' : 'Terminer et voir les Flux Mensuels'"
              class="cursor-pointer"
              @click="goToNextStep"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
