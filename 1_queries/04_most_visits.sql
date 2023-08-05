SELECT properties.city as city, COUNT(reservations.id) as total_reserations
FROM properties
JOIN reservations ON reservations.property_id = properties.id
GROUP BY properties.city
ORDER BY total_reserations DESC;