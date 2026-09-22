<script setup lang="ts">
import LandingHeroShowcase from '~/components/landing/LandingHeroShowcase.vue'
import LandingOverviewDemo from '~/components/landing/LandingOverviewDemo.vue'
import LandingFlowDemo from '~/components/landing/LandingFlowDemo.vue'
import LandingChecklistDemo from '~/components/landing/LandingChecklistDemo.vue'
import LandingFeatures from '~/components/landing/LandingFeatures.vue'
import LandingCta from '~/components/landing/LandingCta.vue'

useSeoMeta({
  title: 'Aiesura — Gestion financière personnelle & planification de flux',
  ogTitle: 'Aiesura — Gestion financière personnelle & planification de flux',
  description: 'Planifiez vos dépenses prévisionnelles avec le système d’itérations et organisez vos virements d’épargne avec la checklist mensuelle.',
  ogDescription: 'Planifiez vos dépenses prévisionnelles avec le système d’itérations et organisez vos virements d’épargne avec la checklist mensuelle.',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- Halos d'ambiance en arrière-plan -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden pointer-events-none -z-10">
      <div class="absolute top-10 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-full blur-3xl" />
      <div class="absolute top-40 right-1/4 w-80 h-80 bg-teal-500/10 dark:bg-teal-400/5 rounded-full blur-3xl" />
    </div>

    <!-- ── 1. HERO SECTION ── -->
    <section class="pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
      <div class="space-y-6 max-w-3xl mx-auto">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0A332C]/10 dark:bg-white/10 text-[#0A332C] dark:text-emerald-300 border border-[#0A332C]/10 dark:border-white/10">
          <UIcon
            name="i-lucide-layers"
            class="w-3.5 h-3.5"
          />
          <span>Gestion financière personnelle</span>
        </div>

        <!-- Titre principal -->
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15]">
          Planifiez vos dépenses et virements, <br class="hidden sm:inline">
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#0A332C] via-emerald-700 to-teal-600 dark:from-emerald-300 dark:via-teal-300 dark:to-emerald-400">
            mois par mois, sans casser vos règles.
          </span>
        </h1>

        <!-- Sous-titre honnête et réaliste -->
        <p class="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Aiesura combine une gestion d’itérations (ajustez une dépense ponctuelle sans altérer sa récurrence) et un planificateur de flux pour exécuter vos virements d’épargne en toute clarté.
        </p>

        <!-- Boutons d'action -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <UButton
            to="/register"
            icon="i-lucide-arrow-right"
            trailing
            label="Créer un compte"
            size="xl"
            color="primary"
            variant="solid"
            class="w-full sm:w-auto font-semibold px-6 cursor-pointer"
          />
          <UButton
            to="#demo"
            icon="i-lucide-sliders-horizontal"
            label="Voir les 3 fonctionnalités clés"
            size="xl"
            color="neutral"
            variant="subtle"
            class="w-full sm:w-auto font-medium px-6 cursor-pointer"
          />
        </div>

        <!-- Points factuels réels -->
        <div class="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
          <span class="flex items-center gap-1.5">
            <UIcon
              name="i-lucide-check-circle-2"
              class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
            />
            Ajustement d’itérations par mois
          </span>
          <span class="flex items-center gap-1.5">
            <UIcon
              name="i-lucide-check-circle-2"
              class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
            />
            Planificateur de règles de virement
          </span>
          <span class="flex items-center gap-1.5">
            <UIcon
              name="i-lucide-check-circle-2"
              class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
            />
            Checklist manuelle de début de mois
          </span>
        </div>
      </div>

      <!-- Showcase Interactif Multi-onglets du Hero -->
      <div class="mt-12">
        <LandingHeroShowcase />
      </div>
    </section>

    <!-- ── 2. SECTION FONCTIONNALITÉS (Bento Grid Factuelle) ── -->
    <section
      id="features"
      class="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-black/5 dark:border-white/10"
    >
      <LandingFeatures />
    </section>

    <!-- ── 3. MINI-DÉMO 1 : VUE D'ENSEMBLE & ITÉRATIONS ── -->
    <section
      id="demo"
      class="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-black/5 dark:border-white/10 space-y-6"
    >
      <div class="max-w-2xl">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0A332C]/10 dark:bg-white/10 text-[#0A332C] dark:text-emerald-300 mb-2">
          <span>01 • Vue d'ensemble</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Ajuster une itération sans modifier la règle récurrente
        </h2>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
          Quand vous créez une dépense récurrente (ex: loyer, électricité), l'application génère ses itérations pour chaque mois. Si une facture est plus élevée ce mois-ci, modifiez uniquement son itération : les autres mois restent intacts.
        </p>
      </div>

      <LandingOverviewDemo />
    </section>

    <!-- ── 4. MINI-DÉMO 2 : RÈGLES DE FLUX ── -->
    <section
      id="flows"
      class="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-black/5 dark:border-white/10 space-y-6"
    >
      <div class="max-w-2xl">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 mb-2">
          <span>02 • Planificateur de flux</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Calcul dynamique de la répartition du salaire
        </h2>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
          Définissez des règles en pourcentage (ex: 20% sur le Livret A) ou en montant fixe (ex: 250 € pour les projets). Changez le salaire avec le curseur pour voir le calcul s'ajuster en direct.
        </p>
      </div>

      <LandingFlowDemo />
    </section>

    <!-- ── 5. MINI-DÉMO 3 : LA CHECKLIST DU 1ER DU MOIS ── -->
    <section
      id="checklist"
      class="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-black/5 dark:border-white/10 space-y-6"
    >
      <div class="max-w-2xl">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 mb-2">
          <span>03 • Checklist mensuelle</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          To-do list des virements à faire manuellement
        </h2>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
          Le 1er du mois, vos règles sont transformées en liste de virements clairs (regroupés par compte destinataire). Faites les virements sur votre banque, cochez-les ici au fur et à mesure.
        </p>
      </div>

      <LandingChecklistDemo />
    </section>

    <!-- ── 6. CALL TO ACTION FINAL ── -->
    <section class="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-black/5 dark:border-white/10">
      <LandingCta />
    </section>
  </div>
</template>
