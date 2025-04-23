import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { successResponse, errorResponse } from '../utils/response.util';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { 
      page = '1', 
      limit = '10', 
      featured, 
      category, 
      platform, 
      search 
    } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    let queryText = `
      SELECT p.* 
      FROM products p
    `;
    
    const queryParams: any[] = [];
    const conditions: string[] = ["p.is_active = TRUE"];
    
    if (featured !== undefined) {
      conditions.push("p.is_featured = $" + (queryParams.length + 1));
      queryParams.push(featured === 'true');
    }
    
    if (search) {
      conditions.push(`(p.name ILIKE $${queryParams.length + 1} OR p.description ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${search}%`);
    }
    
    if (category) {
      queryText = `
        SELECT p.* 
        FROM products p
        JOIN product_category pc ON p.product_id = pc.product_id
        JOIN categories c ON pc.category_id = c.category_id
      `;
      conditions.push(`c.slug = $${queryParams.length + 1}`);
      queryParams.push(category);
    }
    
    if (platform) {
      queryText = `
        SELECT p.* 
        FROM products p
        JOIN product_platform pp ON p.product_id = pp.product_id
        JOIN platforms pl ON pp.platform_id = pl.platform_id
      `;
      conditions.push(`pl.slug = $${queryParams.length + 1}`);
      queryParams.push(platform);
    }
    
    if (conditions.length > 0) {
      queryText += " WHERE " + conditions.join(" AND ");
    }
    
    // Contar total de resultados para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM (${queryText}) as subquery
    `;
    
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total, 10);
    
    // Consulta principal con paginación y ordenamiento
    queryText += `
      ORDER BY p.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    
    queryParams.push(limitNum, offset);
    
    const result = await query(queryText, queryParams);
    
    // Para cada producto, obtener la imagen principal
    const productsWithImages = await Promise.all(result.rows.map(async (product) => {
      const imageResult = await query(
        'SELECT url FROM product_images WHERE product_id = $1 AND is_primary = TRUE LIMIT 1',
        [product.product_id]
      );
      
      return {
        ...product,
        image_url: imageResult.rows.length > 0 ? imageResult.rows[0].url : null
      };
    }));
    
    return res.json(successResponse(
      productsWithImages,
      'Productos obtenidos correctamente',
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    ));
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    
    const result = await query(
      'SELECT * FROM products WHERE slug = $1 AND is_active = TRUE',
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse('Producto no encontrado'));
    }
    
    const product = result.rows[0];
    
    // Obtener imágenes
    const imagesResult = await query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY display_order ASC',
      [product.product_id]
    );
    
    // Obtener plataformas
    const platformsResult = await query(`
      SELECT pp.*, p.name as platform_name, p.slug as platform_slug 
      FROM product_platform pp
      JOIN platforms p ON pp.platform_id = p.platform_id
      WHERE pp.product_id = $1
    `, [product.product_id]);
    
    // Obtener categorías
    const categoriesResult = await query(`
      SELECT pc.*, c.name as category_name, c.slug as category_slug 
      FROM product_category pc
      JOIN categories c ON pc.category_id = c.category_id
      WHERE pc.product_id = $1
    `, [product.product_id]);
    
    // Obtener reseñas
    const reviewsResult = await query(`
      SELECT r.*, u.username 
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
      LIMIT 5
    `, [product.product_id]);
    
    const productWithDetails = {
      ...product,
      images: imagesResult.rows,
      platforms: platformsResult.rows.map(row => ({
        ...row,
        platform: {
          id: row.platform_id,
          name: row.platform_name,
          slug: row.platform_slug,
        }
      })),
      categories: categoriesResult.rows.map(row => ({
        ...row,
        category: {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        }
      })),
      reviews: reviewsResult.rows,
    };
    
    return res.json(successResponse(productWithDetails, 'Producto obtenido correctamente'));
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string || '4', 10);
    
    const result = await query(
      `SELECT p.*, 
       (SELECT url FROM product_images WHERE product_id = p.product_id AND is_primary = TRUE LIMIT 1) as image_url
       FROM products p 
       WHERE p.is_featured = TRUE AND p.is_active = TRUE 
       ORDER BY p.created_at DESC 
       LIMIT $1`,
      [limit]
    );
    
    return res.json(successResponse(result.rows, 'Productos destacados obtenidos correctamente'));
  } catch (error) {
    next(error);
  }
}