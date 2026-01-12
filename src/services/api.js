import { DISHES_API_URL } from '../utils/constants';

export const fetchDishes = async () => {
  try {
    const response = await fetch(DISHES_API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.warn('API response is not an array, attempting to extract dishes...');
      if (data.dishes && Array.isArray(data.dishes)) {
        return data.dishes;
      } else if (Array.isArray(data.data)) {
        return data.data;
      } else {
        throw new Error('Invalid data format received from API');
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching dishes:', error);
    
    console.log('Using fallback dish data');
    return getFallbackDishes();
  }
};

const getFallbackDishes = () => {
  return [
    {
      "id": 1,
      "dishName": "Lasagne",
      "description": "Breaded fried chicken with waffles, and a side of maple syrup.",
      "image": "https://loremflickr.com/300/300/food"
    },
    {
      "id": 2,
      "dishName": "Pho",
      "description": "Three eggs with cilantro, tomatoes, onions, avocados and melted Emmental cheese. With a side of roasted potatoes, and your choice of toast or croissant.",
      "image": "https://loremflickr.com/300/300/food"
    },
    {
      "id": 3,
      "dishName": "Stinky Tofu",
      "description": "Two buttermilk waffles, topped with whipped cream and maple syrup, a side of two eggs served any style, and your choice of smoked bacon or smoked ham.",
      "image": "https://loremflickr.com/300/300/food"
    },
    {
      "id": 4,
      "dishName": "Scotch Eggs",
      "description": "Thick slices of French toast bread, brown sugar, half-and-half and vanilla, topped with powdered sugar. With two eggs served any style, and your choice of smoked bacon or smoked ham.",
      "image": "https://loremflickr.com/300/300/food"
    },
    {
      "id": 5,
      "dishName": "Sushi",
      "description": "Fresh Norwegian salmon, lightly brushed with our herbed Dijon mustard sauce, with choice of two sides.",
      "image": "https://loremflickr.com/300/300/food"
    }
  ];
};