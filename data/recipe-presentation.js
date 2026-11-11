// Complément de la maquette : seul le Poulet possède des étapes détaillées attestées.
export const recipePresentation = {
  "poulet-coco-reunionnais": {
    steps: [
      {
        title: "Préparation des ingrédients",
        actions: [
          "Coupez le poulet en morceaux.",
          "Épluchez et émincez l'oignon.",
          "Lavez et coupez le poivron rouge en lanières.",
        ],
      },
      {
        title: "Cuisson du poulet",
        actions: [
          "Dans une grande cocotte, faites chauffer l'huile d'olive à feu moyen.",
          "Ajoutez les morceaux de poulet et faites-les dorer de tous les côtés pendant environ 5-7 minutes.",
          "Retirez le poulet de la cocotte et réservez-le.",
        ],
      },
      {
        title: "Cuisson des légumes",
        actions: [
          "Dans la même cocotte, ajoutez l'oignon émincé et faites-le revenir jusqu'à ce qu'il soit translucide.",
          "Ajoutez les lanières de poivron rouge et faites-les revenir pendant 3-4 minutes.",
        ],
      },
      {
        title: "Ajout des autres ingrédients",
        actions: [
          "Remettez les morceaux de poulet dans la cocotte.",
          "Ajoutez le coulis de tomate et mélangez bien.",
          "Versez le lait de coco et mélangez à nouveau.",
        ],
      },
      {
        title: "Cuisson finale",
        actions: [
          "Couvrez la cocotte et laissez mijoter à feu doux pendant environ 30-40 minutes, jusqu'à ce que le poulet soit bien cuit et la sauce épaissie.",
          "Remuez de temps en temps pour éviter que la sauce n'attache au fond de la cocotte.",
        ],
      },
      {
        title: "Service",
        actions: [
          "Servez le poulet coco bien chaud, accompagné de riz basmati ou de riz créole pour un repas typiquement réunionnais.",
        ],
      },
    ],
    utensils: [{ name: "Couteau", quantity: 1 }],
    appliances: [{ name: "Cocotte", quantity: 1 }],
  },
};
