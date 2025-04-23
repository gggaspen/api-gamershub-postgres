import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { successResponse, errorResponse } from '../utils/response.util';

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    // Opción para solo obtener categorías principales
    const parentOnly = req.query.parentOnly === 'true';
    
    let queryText = `
      SELECT c.*,
        (SELECT COUNT(*) FROM product_category pc WHERE pc.category_id = c.category_id) as product_count
      FROM categories c
      WHERE c.is_active = TRUE
    `;
    
    if (parentOnly) {
      queryText += ' AND c.parent_id IS NULL';
    }
    
    queryText += ' ORDER BY c.display_order ASC, c.name ASC';
    
    const result = await query(queryText);
    
    // Estructura jerárquica si se solicitan todas las categorías
    if (!parentOnly) {
      // Crear un mapa de categorías por ID
      const categoriesMap = result.rows.reduce((map, category) => {
        map[category.category_id] = {
          ...category,
          subcategories: []
        };
        return map;
      }, {});
      
      // Organizar categorías en estructura jerárquica
      const rootCategories = [];
      result.rows.forEach(category => {
        if (category.parent_id) {
          if (categoriesMap[category.parent_id]) {
            categoriesMap[category.parent_id].subcategories.push(categoriesMap[category.category_id]);
          }
        } else {
          rootCategories.push(categoriesMap[category.category_id]);
        }
      });
      
      return res.json(successResponse(rootCategories, 'Categorías obtenidas correctamente'));
    }
    
    return res.json(successResponse(result.rows, 'Categorías obtenidas correctamente'));
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    
    // Obtener la categoría
    const categoryResult = await query(
      'SELECT * FROM categories WHERE slug = $1 AND is_active = TRUE',
      [slug]
    );
    
    if (categoryResult.rows.length === 0) {
      return res.status(404).json(errorResponse('Categoría no encontrada'));
    }
    
    const category = categoryResult.rows[0];
    
    // Obtener subcategorías si es una categoría principal
    const subcategoriesResult = await query(
      'SELECT * FROM categories WHERE parent_id = $1 AND is_active = TRUE ORDER BY display_order ASC, name ASC',
      [category.category_id]
    );
    
    // Obtener categoría padre si es una subcategoría
    let parentCategory = null;
    if (category.parent_id) {
      const parentResult = await query(
        'SELECT * FROM categories WHERE category_id = $1',
        [category.parent_id]
      );
      if (parentResult.rows.length > 0) {
        parentCategory = parentResult.rows[0];
      }
    }
    
    // Contar productos en esta categoría
    const productCountResult = await query(
      'SELECT COUNT(*) as product_count FROM product_category WHERE category_id = $1',
      [category.category_id]
    );
    
    const categoryWithDetails = {
      ...category,
      product_count: parseInt(productCountResult.rows[0].product_count, 10),
      subcategories: subcategoriesResult.rows,
      parent: parentCategory
    };
    
    return res.json(successResponse(categoryWithDetails, 'Categoría obtenida correctamente'));
  } catch (error) {
    next(error);
  }
}