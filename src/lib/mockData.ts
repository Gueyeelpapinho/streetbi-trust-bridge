// Données mockées complètes pour les signalements
// Ces données sont utilisées quand les données Supabase ne sont pas disponibles

export interface MockReport {
  id: string | number;
  title: string;
  description: string;
  category: string;
  status: "signale" | "en_cours" | "resolu" | "pending" | "in-progress" | "resolved";
  location_address?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at?: string;
  image_url?: string;
  image?: string;
  hedera_hash?: string;
  resolved_by?: string;
  resolution_note?: string;
  resolution_cost?: number;
  assigned_agent?: string;
  author?: string;
  views?: number;
  date?: string;
}

// Données mockées pour les rapports récents (IDs numériques simples)
export const mockReportsSimple: MockReport[] = [
  {
    id: 1,
    title: "Fuite d'eau importante",
    description: "Canalisation cassée sur l'avenue Bourguiba provoquant une importante fuite d'eau et des désagréments pour les riverains. L'eau s'écoule dans la rue depuis 3 jours, causant des inondations et des problèmes de circulation.",
    location: "Plateau, Dakar",
    location_address: "Avenue Bourguiba, Plateau, Dakar",
    status: "signale",
    date: "Il y a 2h",
    category: "eau",
    image: "/placeholder.svg",
    image_url: "/placeholder.svg",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    latitude: 14.6800,
    longitude: -17.4550,
    views: 156,
    author: "Amadou Diop",
  },
  {
    id: 2,
    title: "Éclairage public défaillant",
    description: "Plusieurs lampadaires ne fonctionnent plus depuis une semaine dans le quartier Médina, créant un problème de sécurité. La circulation devient dangereuse la nuit, notamment pour les piétons.",
    location: "Médina, Dakar",
    location_address: "Rue de la République, Médina, Dakar",
    status: "en_cours",
    date: "Il y a 5h",
    category: "eclairage",
    image: "/placeholder.svg",
    image_url: "/placeholder.svg",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    latitude: 14.6950,
    longitude: -17.4500,
    views: 89,
    author: "Fatou Sall",
    assigned_agent: "SENELEC - Service Éclairage Public",
  },
  {
    id: 3,
    title: "Nid de poule dangereux",
    description: "Route très dégradée causant des accidents et endommageant les véhicules. Grand nid-de-poule sur la route principale, plusieurs véhicules ont été endommagés. Risque d'accident élevé.",
    location: "Pikine, Dakar",
    location_address: "Route de Pikine, Dakar",
    status: "signale",
    date: "Il y a 1j",
    category: "voirie",
    image: "/placeholder.svg",
    image_url: "/placeholder.svg",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    latitude: 14.7100,
    longitude: -17.4450,
    views: 234,
    author: "Ousmane Ba",
  },
  {
    id: 4,
    title: "École sans électricité",
    description: "Panne électrique dans l'établissement scolaire, perturbant les cours. L'école primaire est sans électricité depuis une semaine, impactant l'éducation des enfants.",
    location: "Guédiawaye, Dakar",
    location_address: "École primaire de Guédiawaye, Dakar",
    status: "resolu",
    date: "Il y a 2j",
    category: "education",
    image: "/placeholder.svg",
    image_url: "/placeholder.svg",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    latitude: 14.7250,
    longitude: -17.4420,
    views: 178,
    author: "Aissatou Thiam",
    resolved_by: "SENELEC - Service Public",
    resolution_note: "Panne électrique résolue. Réparation du transformateur effectuée avec succès. L'électricité a été rétablie dans l'établissement.",
    resolution_cost: 250000,
    assigned_agent: "SENELEC - Service Public",
  },
];

// Fonction pour obtenir les signalements utilisateur depuis localStorage
export const getUserReports = (): MockReport[] => {
  try {
    const stored = localStorage.getItem("userReports");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Erreur lors de la lecture des signalements utilisateur:", error);
  }
  return [];
};

// Données mockées complètes pour la carte (IDs avec préfixe "mock-")
export const mockReportsMap: MockReport[] = [
  {
    id: "mock-1",
    title: "Fuite d'eau importante",
    description: "Fuite d'eau majeure sur la canalisation principale. L'eau s'écoule dans la rue depuis 3 jours, causant des inondations.",
    category: "eau",
    status: "signale",
    location_address: "Avenue Cheikh Anta Diop, Plateau, Dakar",
    latitude: 14.6800,
    longitude: -17.4550,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop",
  },
  {
    id: "mock-2",
    title: "Éclairage public défaillant",
    description: "Plusieurs lampadaires ne fonctionnent pas dans cette zone, rendant la circulation dangereuse la nuit.",
    category: "eclairage",
    status: "en_cours",
    location_address: "Rue de la République, Médina, Dakar",
    latitude: 14.6950,
    longitude: -17.4500,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
    assigned_agent: "SENELEC - Service Éclairage Public",
  },
  {
    id: "mock-3",
    title: "Nid-de-poule dangereux",
    description: "Grand nid-de-poule sur la route principale, plusieurs véhicules ont été endommagés. Risque d'accident élevé.",
    category: "voirie",
    status: "signale",
    location_address: "Boulevard Général de Gaulle, Fann, Dakar",
    latitude: 14.7100,
    longitude: -17.4450,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
  },
  {
    id: "mock-4",
    title: "Toiture de l'école endommagée",
    description: "Toiture de l'école primaire endommagée par les intempéries. Réparation en cours par les autorités.",
    category: "education",
    status: "en_cours",
    location_address: "École primaire de Grand Yoff, Dakar",
    latitude: 14.7250,
    longitude: -17.4420,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop",
    assigned_agent: "Direction de l'Éducation",
  },
  {
    id: "mock-5",
    title: "Déchets accumulés",
    description: "Accumulation importante de déchets non collectés depuis plusieurs semaines. Odeurs nauséabondes et risques sanitaires.",
    category: "environnement",
    status: "signale",
    location_address: "Quartier Parcelles Assainies, Dakar",
    latitude: 14.6650,
    longitude: -17.4400,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&h=600&fit=crop",
  },
  {
    id: "mock-6",
    title: "Panneau de signalisation manquant",
    description: "Panneau de stop manquant à l'intersection, plusieurs accidents évités de justesse. Intervention urgente nécessaire.",
    category: "securite",
    status: "signale",
    location_address: "Carrefour Liberté 6, Dakar",
    latitude: 14.7000,
    longitude: -17.4470,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
  },
  {
    id: "mock-7",
    title: "Canalisation réparée",
    description: "Fuite d'eau réparée avec succès. La zone est maintenant sécurisée et l'eau est rétablie normalement.",
    category: "eau",
    status: "resolu",
    location_address: "Avenue Blaise Diagne, Almadies, Dakar",
    latitude: 14.7400,
    longitude: -17.4320,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_by: "Service des Eaux de Dakar",
    resolution_note: "Canalisation principale réparée. Remplacement du tronçon défectueux effectué avec succès.",
    resolution_cost: 150000,
    image_url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop",
  },
  {
    id: "mock-8",
    title: "Éclairage rétabli",
    description: "Tous les lampadaires ont été réparés. La zone est maintenant bien éclairée et sécurisée pour les piétons.",
    category: "eclairage",
    status: "resolu",
    location_address: "Rue Mermoz, Point E, Dakar",
    latitude: 14.7150,
    longitude: -17.4380,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_by: "SENELEC - Service Éclairage Public",
    resolution_note: "Remplacement des ampoules défectueuses et vérification de l'ensemble du réseau d'éclairage.",
    resolution_cost: 75000,
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
  },
  {
    id: "mock-9",
    title: "Route réparée",
    description: "Nid-de-poule comblé et route refaite. La circulation est maintenant fluide et sécurisée.",
    category: "voirie",
    status: "resolu",
    location_address: "Boulevard du Général de Gaulle, Ouakam, Dakar",
    latitude: 14.7300,
    longitude: -17.4350,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_by: "Direction des Travaux Publics",
    resolution_note: "Réfection complète de la chaussée sur 50 mètres. Asphaltage effectué selon les normes.",
    resolution_cost: 450000,
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
  },
  {
    id: "mock-10",
    title: "Centre de santé - Manque de matériel",
    description: "Le centre de santé manque de matériel médical de base. Besoin urgent de fournitures pour soigner les patients.",
    category: "sante",
    status: "en_cours",
    location_address: "Centre de santé de Pikine, Dakar",
    latitude: 14.6750,
    longitude: -17.4520,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
    assigned_agent: "Ministère de la Santé",
  },
  {
    id: "mock-11",
    title: "Éclairage défaillant - Zone commerciale",
    description: "Plusieurs lampadaires éteints dans la zone commerciale, impactant la sécurité des commerces et des clients.",
    category: "eclairage",
    status: "signale",
    location_address: "Marché Sandaga, Centre-ville, Dakar",
    latitude: 14.6900,
    longitude: -17.4430,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
  },
  {
    id: "mock-12",
    title: "Arbre menaçant",
    description: "Grand arbre penché menaçant de tomber sur la route. Risque pour les passants et les véhicules.",
    category: "environnement",
    status: "en_cours",
    location_address: "Avenue Faidherbe, Plateau, Dakar",
    latitude: 14.7050,
    longitude: -17.4480,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&h=600&fit=crop",
    assigned_agent: "Service des Espaces Verts",
  },
  {
    id: "mock-13",
    title: "Route dégradée - Diamniadio",
    description: "Route principale en mauvais état avec plusieurs nids-de-poule. Circulation difficile et dangereuse.",
    category: "voirie",
    status: "signale",
    location_address: "Avenue de l'Indépendance, Diamniadio",
    latitude: 14.7500,
    longitude: -17.4000,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
  },
  {
    id: "mock-14",
    title: "Éclairage public manquant",
    description: "Absence totale d'éclairage public dans cette zone résidentielle. Sécurité des habitants compromise.",
    category: "eclairage",
    status: "en_cours",
    location_address: "Zone résidentielle, Diamniadio",
    latitude: 14.7600,
    longitude: -17.3950,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
    assigned_agent: "SENELEC - Service Éclairage Public",
  },
  {
    id: "mock-15",
    title: "Problème d'assainissement",
    description: "Système d'assainissement défaillant causant des inondations lors des pluies. Risque sanitaire élevé.",
    category: "eau",
    status: "signale",
    location_address: "Quartier Pikine Est, Pikine",
    latitude: 14.7500,
    longitude: -17.3800,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop",
  },
  {
    id: "mock-16",
    title: "École sans électricité",
    description: "École primaire sans électricité depuis une semaine. Impact sur l'éducation des enfants.",
    category: "education",
    status: "en_cours",
    location_address: "École primaire de Thiaroye, Thiaroye",
    latitude: 14.7200,
    longitude: -17.3600,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop",
    assigned_agent: "SENELEC - Service Public",
  },
  {
    id: "mock-17",
    title: "Décharge sauvage",
    description: "Décharge sauvage non autorisée causant des problèmes environnementaux et sanitaires.",
    category: "environnement",
    status: "signale",
    location_address: "Zone industrielle, Rufisque",
    latitude: 14.7100,
    longitude: -17.2700,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&h=600&fit=crop",
  },
  {
    id: "mock-18",
    title: "Route réparée - Diamniadio",
    description: "Route principale récemment réparée. Circulation fluide et sécurisée.",
    category: "voirie",
    status: "resolu",
    location_address: "Boulevard de Diamniadio, Diamniadio",
    latitude: 14.7550,
    longitude: -17.4050,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_by: "Mairie de Diamniadio",
    resolution_note: "Réparation complète de la route effectuée. Signalisation routière remise en place.",
    resolution_cost: 320000,
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
  },
];

// Fonction helper pour récupérer un rapport mocké par ID
export const getMockReportById = (id: string | number): MockReport | null => {
  // Chercher dans les rapports simples (IDs numériques)
  const simpleReport = mockReportsSimple.find(r => r.id === id || String(r.id) === String(id));
  if (simpleReport) {
    return simpleReport;
  }
  
  // Chercher dans les rapports de la carte (IDs avec préfixe "mock-")
  const mapReport = mockReportsMap.find(r => r.id === id || String(r.id) === String(id));
  if (mapReport) {
    return mapReport;
  }
  
  return null;
};

// Fonction pour normaliser le statut (convertir "pending"/"in-progress"/"resolved" en "signale"/"en_cours"/"resolu")
export const normalizeStatus = (status: string): "signale" | "en_cours" | "resolu" => {
  if (status === "pending" || status === "signale") return "signale";
  if (status === "in-progress" || status === "en_cours") return "en_cours";
  if (status === "resolved" || status === "resolu") return "resolu";
  return "signale";
};


