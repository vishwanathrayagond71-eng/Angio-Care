/* ==========================================================================
   ANGIOCARE - KNOWLEDGE BASE MODULE
   ========================================================================== */

const kbModule = (() => {
    // Extensive repository of agricultural information and schemes
    const kbData = [
        {
            title: "Tomato Early Blight",
            crop: "Tomato",
            category: "fungal",
            symptoms: "Target-board spots (concentric circles) on older leaves. Leaves yellow and fall off.",
            remedy: "Prune lower foliage, apply copper fungicide, and maintain mulching.",
            details: "Early Blight is caused by the fungus Alternaria solani. It can infect foliage, stems, and fruit, and overwinter in soil debris. Spreads rapidly under frequent rain spells."
        },
        {
            title: "Rice Blast",
            crop: "Rice",
            category: "fungal",
            symptoms: "Spindle-shaped lesions on leaves. Neck rot and node collapse.",
            remedy: "Avoid excess Nitrogen, spray Tricyclazole, grow blast-resistant varieties.",
            details: "One of the most destructive diseases of rice. Magnaporthe oryzae destroys grain yields across major farming districts during humid seasons."
        },
        {
            title: "Bacterial Leaf Blight",
            crop: "Rice",
            category: "bacterial",
            symptoms: "Yellow-white wavy lesions starting at leaf margins, turning gray-white.",
            remedy: "Improve drainage, spray Agrimycin-100 or copper oxychloride, destroy alternative hosts.",
            details: "Caused by Xanthomonas oryzae, bacterial blight enters leaf tissues through natural openings or wounds, spread by storm winds."
        },
        {
            title: "Potato Late Blight",
            crop: "Potato",
            category: "fungal",
            symptoms: "Irregular dark water-soaked spots with white fluffy mold underneath in humid conditions.",
            remedy: "Use clean tubers, spray Metalaxyl or Mancozeb, practice crop rotation.",
            details: "Late Blight is triggered by Phytophthora infestans. Spores spread rapidly through wind currents, infecting fields overnight."
        },
        {
            title: "Wheat Stripe Rust",
            crop: "Wheat",
            category: "fungal",
            symptoms: "Linear stripes of bright yellow-orange powder pustules on wheat leaves.",
            remedy: "Sow resistant DBW strains, spray Propiconazole (Tilt) immediately.",
            details: "Puccinia striiformis is a devastating windborne disease that attacks wheat in cooler northern regions of India."
        },
        {
            title: "Cotton Alternaria Spot",
            crop: "Cotton",
            category: "fungal",
            symptoms: "Brown leaf spots with concentric rings, leading to shot-hole dry patches.",
            remedy: "Spray Carbendazim, enhance soil Potassium feed, rotate fields.",
            details: "Alternaria macrospora affects cotton crops, particularly under nutrient stress, reducing photosynthesis and cotton boll yield."
        },
        {
            title: "Sugarcane Red Rot",
            crop: "Sugarcane",
            category: "fungal",
            symptoms: "Reddish spots on midrib, internal stalk splits showing red flesh with horizontal white bands.",
            remedy: "Use certified disease-free setts, improve field drainage, treat setts in hot water.",
            details: "Known as the 'cancer' of sugarcane, Colletotrichum falcatum is highly seed-borne and waterlogged-field dependent."
        },
        {
            title: "Banana Black Sigatoka",
            crop: "Banana",
            category: "fungal",
            symptoms: "Dark brown/black streaks along veins, leading to leaf necrosis.",
            remedy: "Prune dead leaves, keep wide spacing, spray mineral-oil emulsions.",
            details: "Sigatoka reduces plant leaf surface, resulting in premature fruit ripening and massive yield reductions."
        },
        {
            title: "Rice Tungro Virus",
            crop: "Rice",
            category: "viral",
            symptoms: "Yellowing of leaves, stunted plant height, reduced tillering, delayed flowering.",
            remedy: "Uproot infected clumps, grow resistant varieties, control green leafhopper vectors.",
            details: "Transmitted by green leafhoppers, Tungro is a devastating viral disease that severely limits rice growth, leaf development, and grain yields."
        },
        {
            title: "Wheat Powdery Mildew",
            crop: "Wheat",
            category: "fungal",
            symptoms: "White, powdery patches appearing first on lower leaves and stems, turning gray-brown.",
            remedy: "Prune dense canopy, apply sulfur dust or baking soda sprays, grow resistant varieties.",
            details: "Caused by Blumeria graminis, this fungus thrives in cool, damp environments with dense planting and high nitrogen fertilization."
        },
        {
            title: "Loose Smut",
            crop: "Wheat",
            category: "fungal",
            symptoms: "Kernel tissue in ears is replaced by black, powdery spores. Heads look charcoal-covered.",
            remedy: "Treat seeds with hot water (Solar treatment) or Carboxin, rogue out infected smut heads.",
            details: "An internally seed-borne fungal infection caused by Ustilago nuda, where healthy grain heads are replaced by dark teliospores."
        },
        {
            title: "Tomato Yellow Leaf Curl Virus",
            crop: "Tomato",
            category: "viral",
            symptoms: "Severe stunting, leaf margins curling upwards and turning yellow, complete crop failure.",
            remedy: "Use yellow sticky traps, grow inside insect nets, spray neem oil formulations.",
            details: "Transmitted by whiteflies, this virus causes severe shoot stunting and stops fruit production entirely under dry, warm weather."
        },
        {
            title: "Tomato Leaf Mold",
            crop: "Tomato",
            category: "fungal",
            symptoms: "Pale green or yellow spots on upper leaf surfaces, olive-green/purple velvety mold underneath.",
            remedy: "Reduce humidity, prune dense spots, avoid overhead watering, spray compost tea.",
            details: "Passalora fulva thrives in high relative humidity and warm climates, attacking foliage and reducing tomato yield under greenhouse setups."
        },
        {
            title: "Potato Black Scurf",
            crop: "Potato",
            category: "fungal",
            symptoms: "Black, dirt-like sclerotia on tuber surfaces that don't wash off. Reddish-brown stem cankers.",
            remedy: "Use certified disease-free seed, perform soil solarization, plant in warm soils.",
            details: "Rhizoctonia solani is a soil-borne fungus that causes black scurf on tubers and cankers on underground stems, reducing market quality."
        },
        {
            title: "Common Rust",
            crop: "Corn",
            category: "fungal",
            symptoms: "Oval or elongated reddish-brown pustules on both upper and lower leaf surfaces.",
            remedy: "Sow rust-resistant hybrids, apply neem oil sprays, practice deep autumn tillage.",
            details: "Puccinia sorghi causes common rust in corn, thriving under high humidity and moderate temperatures, spreading quickly via wind."
        },
        {
            title: "Corn Common Smut",
            crop: "Corn",
            category: "fungal",
            symptoms: "Fleshy, white-gray galls (blisters) containing black spores on ears, tassels, leaves, and stalks.",
            remedy: "Harvest and destroy galls before rupture, rotate crops with non-graminaceous plants.",
            details: "Ustilago maydis infects corn through mechanical wounds or crop damage, replacing healthy kernels with powdery black smut spores."
        },
        {
            title: "Cotton Bacterial Blight",
            crop: "Cotton",
            category: "bacterial",
            symptoms: "Angular water-soaked leaf spots turning dark brown, black arm stem lesions, rotting bolls.",
            remedy: "Sow acid-delinted seeds, clear residues post-harvest, practice a 2-year crop rotation.",
            details: "Xanthomonas citri causes angular leaf spots and black arm. It spreads rapidly via splashing rain, high winds, and overhead sprinkler irrigation."
        },
        {
            title: "Sugarcane Grassy Shoot",
            crop: "Sugarcane",
            category: "bacterial",
            symptoms: "Excessive tillering giving a grassy clump appearance, thin yellow chlorotic shoots.",
            remedy: "Subject planting setts to hot water treatment, rogue out infected clumps immediately.",
            details: "Transmitted by aphid vectors, this phytoplasma infection stunts sugarcane stalks, causing them to form dense grass-like clusters without sugarcane yield."
        },
        {
            title: "Banana Panama Disease",
            crop: "Banana",
            category: "fungal",
            symptoms: "Progressive yellowing of leaf margins, leaf collapse (skirt effect), splitting of pseudostems.",
            remedy: "Grow resistant tissue-cultured plantlets (Grand Naine), sanitize farming tools, apply Trichoderma.",
            details: "Fusarium oxysporum is a soil-borne fungus that enters banana roots, destroying the plant's vascular system and causing irreversible wilting."
        },
        {
            title: "PM-KISAN Samman Nidhi",
            crop: "All",
            category: "scheme",
            symptoms: "Financial support for landholding farmer families.",
            remedy: "Receive ₹6,000 annually in three direct installments of ₹2,000.",
            details: "Central sector government scheme providing income support to all landholding farmers families in India to buy agricultural inputs."
        },
        {
            title: "Pradhan Mantri Fasal Bima Yojana",
            crop: "All",
            category: "scheme",
            symptoms: "Financial protection against crop failures due to natural disasters.",
            remedy: "Low premium rates (1.5% - 2% for foodgrains, 5% for commercial crops) to secure loans.",
            details: "National crop insurance scheme providing comprehensive risk cover for crops against non-preventable natural calamities and pest/disease outbreaks."
        },
        {
            title: "Soil Health Card Scheme",
            crop: "All",
            category: "scheme",
            symptoms: "Unbalanced soil fertilizer application and degrading yield.",
            remedy: "Get soil nutrient health audits and customized fertilizer dosages.",
            details: "Government program analyzing soil samples to provide farmers with a card indicating nutrient deficiencies (N, P, K, sulfur, micronutrients) and correction tips."
        },
        {
            title: "Paramparagat Krishi Vikas Yojana",
            crop: "All",
            category: "scheme",
            symptoms: "High pesticide usage, chemical soil degradation.",
            remedy: "Financial assistance for organic farming clusters (₹50,000 per hectare for 3 years).",
            details: "Central scheme supporting organic crop production, cluster formation, PGS certification, and marketing of organic foods in India."
        }
    ];

    // Initialize searches and events
    function init() {
        const searchInput = document.getElementById('kb-search-input');
        const cropFilter = document.getElementById('kb-crop-filter');
        const catFilter = document.getElementById('kb-category-filter');

        searchInput.addEventListener('input', renderKnowledgeBase);
        cropFilter.addEventListener('change', renderKnowledgeBase);
        catFilter.addEventListener('change', renderKnowledgeBase);

        // First render
        renderKnowledgeBase();
    }

    // Filter and render knowledge library cards
    function renderKnowledgeBase() {
        const query = document.getElementById('kb-search-input').value.toLowerCase().trim();
        const crop = document.getElementById('kb-crop-filter').value;
        const category = document.getElementById('kb-category-filter').value;

        const container = document.getElementById('kb-grid-container');
        container.innerHTML = '';

        const filtered = kbData.filter(item => {
            const matchesQuery = item.title.toLowerCase().includes(query) || 
                                 item.symptoms.toLowerCase().includes(query) ||
                                 item.details.toLowerCase().includes(query);
            const matchesCrop = !crop || item.crop === crop || item.crop === 'All';
            const matchesCat = !category || item.category === category;

            return matchesQuery && matchesCrop && matchesCat;
        });

        if (filtered.length === 0) {
            container.innerHTML = `<div style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 48px; font-style: italic;">No matching results found in the library.</div>`;
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'kb-card glass-panel';
            card.innerHTML = `
                <div>
                    <div class="kb-card-tags">
                        <span class="kb-tag tag-crop">${item.crop === 'All' ? 'General' : item.crop}</span>
                        <span class="kb-tag tag-category">${formatCategory(item.category)}</span>
                    </div>
                    <h3 style="font-size: 18px; margin-bottom: 12px;">${item.title}</h3>
                    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;"><strong>Symptoms:</strong> ${item.symptoms}</p>
                    <p style="font-size: 13px; color: var(--text-main); line-height:1.5;">${item.details}</p>
                </div>
                <div style="margin-top: 16px; border-top: 1px solid var(--border-color); padding-top: 12px; font-size: 13px; font-weight: 500;">
                    <span style="color: var(--primary);">Remedy:</span> ${item.remedy}
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Helper to format category tags
    function formatCategory(cat) {
        switch (cat) {
            case 'fungal': return 'Fungal Disease';
            case 'bacterial': return 'Bacterial Disease';
            case 'viral': return 'Viral Disease';
            case 'pest': return 'Insect Pest';
            case 'scheme': return 'Govt Scheme';
            default: return 'Information';
        }
    }

    return {
        init,
        kbData
    };
})();
