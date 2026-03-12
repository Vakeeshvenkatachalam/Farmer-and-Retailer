
package com.farmer.service;
import org.springframework.stereotype.Service;
import com.farmer.model.Product;
import com.farmer.repository.ProductRepository;
@Service
public class ProductService {
 private final ProductRepository repo;
 public ProductService(ProductRepository repo){this.repo=repo;}
 public Product add(Product p){return repo.save(p);}
}
