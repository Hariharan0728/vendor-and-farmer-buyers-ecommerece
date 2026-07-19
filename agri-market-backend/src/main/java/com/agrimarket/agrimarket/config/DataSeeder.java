package com.agrimarket.agrimarket.config;

import com.agrimarket.agrimarket.model.Category;
import com.agrimarket.agrimarket.model.Product;
import com.agrimarket.agrimarket.repository.CategoryRepository;
import com.agrimarket.agrimarket.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        categoryRepository.deleteAll();
        productRepository.deleteAll();

        Category seeds = Category.builder().name("Seeds").description("High yield certified seeds for all major crops").tags(List.of("seeds","certified")).build();
        Category fertilizers = Category.builder().name("Fertilizers").description("Organic and chemical fertilizers for optimal crop growth").tags(List.of("fertilizer","organic","chemical")).build();
        Category pesticides = Category.builder().name("Pesticides").description("Government-approved pest control solutions").tags(List.of("pest","chemical","compliance")).build();

        categoryRepository.saveAll(List.of(seeds, fertilizers, pesticides));

        Product p1 = Product.builder()
                .name("Premium Wheat Seeds")
                .description("HD-2967 certified high-yielding wheat seeds, ideal for rabi season. Resistant to rust disease. Suitable for irrigated conditions.")
                .categoryId(seeds.getId())
                .brand("AgriGenetics")
                .price(1200.0)
                .unit("50 kg bag")
                .stockQuantity(500)
                .applicableCrops(List.of("Wheat"))
                .status("ACTIVE")
                .images(List.of("/images/wheat.png"))
                .build();

        Product p2 = Product.builder()
                .name("Organic Rice Seeds (Basmati)")
                .description("Premium Basmati 1121 rice variety with exceptional aroma. Suitable for alluvial soil and kharif season. Germination rate above 90%.")
                .categoryId(seeds.getId())
                .brand("GreenHarvest")
                .price(850.0)
                .unit("10 kg packet")
                .stockQuantity(300)
                .applicableCrops(List.of("Rice","Paddy"))
                .status("ACTIVE")
                .images(List.of("/images/rice.png"))
                .build();

        Product p3 = Product.builder()
                .name("Urea Fertilizer (46% N)")
                .description("Standard granular urea with 46% nitrogen content. Ideal as a top-dressing fertilizer for wheat, maize, and sugarcane. Government subsidized rates available.")
                .categoryId(fertilizers.getId())
                .brand("NationalFert")
                .price(350.0)
                .unit("50 kg bag")
                .stockQuantity(1000)
                .applicableCrops(List.of("Wheat","Maize","Sugarcane","Rice"))
                .status("ACTIVE")
                .images(List.of("/images/urea.png"))
                .build();

        Product p4 = Product.builder()
                .name("NPK 19-19-19 Compound Fertilizer")
                .description("Balanced NPK fertilizer for all stages of crop growth. Water-soluble formula for drip and foliar application. Enhances root development and flowering.")
                .categoryId(fertilizers.getId())
                .brand("FertoChem")
                .price(1800.0)
                .unit("25 kg bag")
                .stockQuantity(400)
                .applicableCrops(List.of("Vegetables","Cotton","Soybean","Tomato"))
                .status("ACTIVE")
                .images(List.of("/images/npk.png"))
                .build();

        Product p5 = Product.builder()
                .name("Chlorpyrifos Insecticide")
                .description("Broad-spectrum organophosphate insecticide effective against stem borer, aphids and soil insects. Registration No: CIB-1145-2021. Use protective equipment during application.")
                .categoryId(pesticides.getId())
                .brand("CropShield")
                .price(620.0)
                .unit("1 Litre bottle")
                .stockQuantity(250)
                .registrationNumber("CIB-1145-2021")
                .applicableCrops(List.of("Cotton","Rice","Maize","Sugarcane"))
                .status("ACTIVE")
                .images(List.of("/images/pesticide.png"))
                .build();

        Product p6 = Product.builder()
                .name("Mancozeb Fungicide 75% WP")
                .description("Protective contact fungicide for downy mildew, early blight and leaf spot control. Certified by Central Insecticides Board. Registration No: CIB-8821-2019.")
                .categoryId(pesticides.getId())
                .brand("BioGaurd")
                .price(480.0)
                .unit("500 gm packet")
                .stockQuantity(350)
                .registrationNumber("CIB-8821-2019")
                .applicableCrops(List.of("Potato","Tomato","Grapes","Onion"))
                .status("ACTIVE")
                .images(List.of("/images/pesticide.png"))
                .build();

        productRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6));
    }
}
