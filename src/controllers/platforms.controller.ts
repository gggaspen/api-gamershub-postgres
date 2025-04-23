import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { successResponse, errorResponse } from '../utils/response.util';

export async function getPlatforms(req: Request, res: Response, next: NextFunction) {
  try {
    // Filtro por plataformas activas
    const activeOnly = req.query.activeOnly !== 'false';
    
    let queryText = `
      SELECT p.*,
        (SELECT COUNT(*) FROM product_platform pp WHERE pp.platform_id = p.platform_id) as product_count
      FROM platforms p
    `;
    
    const queryParams: any[] = [];
    
    if (activeOnly) {
      queryText += ' WHERE p.is_active = TRUE';
    }
    
    queryText += ' ORDER BY p.display_order ASC, p.name ASC';
    
    const result = await query(queryText, queryParams);
    
    return res.json(successResponse(result.rows, 'Plataformas obtenidas correctamente'));
  } catch (error) {
    next(error);
  }
}

export async function getPlatformBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    
    // Obtener la plataforma
    const platformResult = await query(
      'SELECT * FROM platforms WHERE slug = $1',
      [slug]
    );
    
    if (platformResult.rows.length === 0) {
      return res.status(404).json(errorResponse('Plataforma no encontrada'));
    }
    
    const platform = platformResult.rows[0];
    
    // Contar productos en esta plataforma
    const productCountResult = await query(
      'SELECT COUNT(*) as product_count FROM product_platform WHERE platform_id = $1',
      [platform.platform_id]
    );
    
    // Obtener algunos productos destacados de esta plataforma
    const featuredProductsResult = await query(`
      SELECT p.*, 
      (SELECT url FROM product_images WHERE product_id = p.product_id AND is_primary = TRUE LIMIT 1) as image_url
      FROM products p
      JOIN product_platform pp ON p.product_id = pp.product_id
      WHERE pp.platform_id = $1 AND p.is_featured = TRUE AND p.is_active = TRUE
      ORDER BY p.created_at DESC
      LIMIT 5
    `, [platform.platform_id]);
    
    const platformWithDetails = {
      ...platform,
      product_count: parseInt(productCountResult.rows[0].product_count, 10),
      featured_products: featuredProductsResult.rows
    };
    
    return res.json(successResponse(platformWithDetails, 'Plataforma obtenida correctamente'));
  } catch (error) {
    next(error);
  }
}