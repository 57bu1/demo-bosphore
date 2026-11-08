export const categories = [
  {
    id: "sandwichs",
    number: "01",
    title: "Sandwichs & accompagnements",
    items: [
      { name: "Sandwich kebab", detail: "Servi avec frites", price: "15 €" },
      { name: "Tacos", detail: "Servi avec frites", price: "15 €" },
      { name: "Sandwich poulet", detail: "Servi avec frites", price: "15 €" },
      { name: "Sandwich galette", detail: "Servi avec frites", price: "15 €" },
      { name: "Sandwich américain", detail: "Servi avec frites", price: "15 €" },
      { name: "Sandwich kofte", detail: "Servi avec frites", price: "15 €" },
      { name: "Frites", detail: "Portion de frites", price: "5 €" },
    ],
  },
  {
    id: "assiettes",
    number: "02",
    title: "Assiettes",
    items: [
      { name: "Assiette kebab", detail: "Servie avec frites et pain", price: "22 €" },
      { name: "Assiette américain", detail: "Servie avec frites et pain", price: "24 €" },
      { name: "Assiette poulet", detail: "Servie avec frites et pain", price: "24 €" },
      { name: "Assiette kofte", detail: "Servie avec frites et pain", price: "24 €" },
      { name: "Assiette mixte 3 viandes", detail: "Servie avec frites et pain", price: "33 €" },
      { name: "Barquette de viande et frites", detail: "Viande accompagnée de frites", price: "15 €" },
    ],
  },
  {
    id: "burgers",
    number: "03",
    title: "Burgers",
    items: [
      { name: "Hamburger", detail: "Servi avec frites", price: "12 €" },
      { name: "Cheeseburger", detail: "Servi avec frites", price: "14 €" },
      { name: "Double cheeseburger", detail: "Servi avec frites", price: "16 €" },
    ],
  },
  {
    id: "boissons",
    number: "04",
    title: "Boissons",
    items: [
      { name: "Coca-Cola", detail: "50 cl", price: "7 €" },
      { name: "Coca-Cola Cherry", detail: "50 cl", price: "7 €" },
      { name: "Fanta Orange", detail: "50 cl", price: "7 €" },
      { name: "Orangina", detail: "33 cl", price: "6 €" },
    ],
  },
] as const;
