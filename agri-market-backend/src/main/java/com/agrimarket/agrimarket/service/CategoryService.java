package com.agrimarket.agrimarket.service;

import com.agrimarket.agrimarket.exception.ResourceNotFoundException;
import com.agrimarket.agrimarket.model.Category;
import com.agrimarket.agrimarket.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(String id, Category updated) {
        Category existing = getCategoryById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setParentCategoryId(updated.getParentCategoryId());
        existing.setTags(updated.getTags());
        return categoryRepository.save(existing);
    }

    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }
}
