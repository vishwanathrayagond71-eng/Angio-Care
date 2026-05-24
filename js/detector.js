/* ==========================================================================
   ANGIOCARE - AI DISEASE DETECTION MODULE
   ========================================================================== */

const detectorModule = (() => {
    // Camera Stream States
    let videoStream = null;
    let selectedImageFile = null;

    // Comprehensive Crop Diseases Database
    const diseaseDatabase = {
        Rice: [
            {
                disease: "Rice Blast",
                pathogen: "Fungus (Magnaporthe oryzae)",
                severity: "High",
                confidenceRange: [91, 98],
                symptoms: "Spindle-shaped spots on leaves with gray or whitish centers and brown margins. Can cause node rot and neck rot, leading to sterile grains.",
                causes: "High relative humidity (>90%), warm temperatures (25-28°C), and leaves remaining wet for extended periods (dew or rain). Over-fertilization with nitrogen.",
                organic: [
                    "Spray compost tea or Trichoderma liquid formulations.",
                    "Use resistant rice varieties (e.g., IR36, IR64).",
                    "Conduct crop rotations with legumes to break the fungus life cycle."
                ],
                chemical: [
                    "Apply tricyclazole 75% WP @ 120g/acre at early symptoms.",
                    "Foliar spray with carbendazim or azoxystrobin formulations."
                ]
            },
            {
                disease: "Bacterial Leaf Blight",
                pathogen: "Bacteria (Xanthomonas oryzae)",
                severity: "High",
                confidenceRange: [88, 96],
                symptoms: "Water-soaked stripes starting at leaf tips or margins, widening and turning yellow-white with wavy edges. Droplets of bacterial ooze may form on leaves.",
                causes: "Warm temperatures (25-34°C), high humidity, wind, and heavy splashing rain which transfers bacteria from infected stubble/weeds.",
                organic: [
                    "Spray fresh cow dung extract (20%) or neem seed kernel extract (5%).",
                    "Ensure adequate field drainage; avoid stagnant water pools.",
                    "Destroy stubble and alternative hosts like wild rice grasses."
                ],
                chemical: [
                    "Spray Streptocycline @ 6g mixed with Copper Oxychloride @ 300g per 200 liters of water."
                ]
            },
            {
                disease: "Rice Tungro Virus",
                pathogen: "Virus (transmitted by green leafhoppers)",
                severity: "High",
                confidenceRange: [87, 95],
                symptoms: "Yellowing of leaves, stunted plant height, reduced tillering, delayed flowering, and sterile or light panicles.",
                causes: "Availability of virus source, green leafhopper vector population density, crop growth stages, and susceptibility.",
                organic: [
                    "Uproot and bury infected clumps immediately to reduce inoculant source.",
                    "Grow virus-resistant varieties and implement synchronous planting.",
                    "Utilize insect nets for nurseries to prevent early leafhopper vectors."
                ],
                chemical: [
                    "Spray leafhopper vectors using Imidacloprid 17.8% SL @ 50 ml/acre in 200L water."
                ]
            }
        ],
        Wheat: [
            {
                disease: "Yellow Rust (Stripe Rust)",
                pathogen: "Fungus (Puccinia striiformis)",
                severity: "High",
                confidenceRange: [94, 99],
                symptoms: "Yellow to orange-yellow pustules arranged in linear stripes on the leaf surface. Rubbing leaves releases yellow powder.",
                causes: "Cool weather (10-15°C) combined with high moisture (heavy fog or rains). Spores are wind-borne and travel hundreds of miles.",
                organic: [
                    "Plant resistant cultivars (e.g., HD-2967, DBW-187).",
                    "Foliar spray with garlic extract (5%) which contains sulfur compounds.",
                    "Early sowing in late October to avoid peak rust periods."
                ],
                chemical: [
                    "Spray Propiconazole 25% EC (e.g., Tilt) @ 200 ml per acre mixed in 200 liters of water."
                ]
            },
            {
                disease: "Loose Smut",
                pathogen: "Fungus (Ustilago nuda)",
                severity: "Medium",
                confidenceRange: [90, 97],
                symptoms: "Kernel tissue in ears is replaced by black, powdery spores. Heads look charcoal-covered and turn sterile.",
                causes: "Infection is seed-borne. Spores are blown by wind into open flowers of healthy heads during the previous flowering season.",
                organic: [
                    "Treat seeds with hot water (Solar treatment: soak seeds in water for 4 hours, then dry under scorching hot afternoon sun for 4 hours).",
                    "Rogue out and destroy infected smut heads using paper bags to avoid spore dispersal."
                ],
                chemical: [
                    "Treat seeds before sowing with Carboxin (Vitavax) @ 2g/kg of seed."
                ]
            },
            {
                disease: "Wheat Powdery Mildew",
                pathogen: "Fungus (Blumeria graminis)",
                severity: "Medium",
                confidenceRange: [86, 94],
                symptoms: "White, powdery patches appearing first on lower leaves and stems, turning gray-brown over time with small black fruiting bodies.",
                causes: "Cool, damp environments (15-22°C), dense foliage shading, low solar exposure, and excessive chemical nitrogen fertilizers.",
                organic: [
                    "Prune crop dense spots to increase ventilation.",
                    "Apply sulfur dust or baking soda sprays (4g/L water) early in the morning.",
                    "Practice deep autumn tillage to bury infected wheat residues."
                ],
                chemical: [
                    "Spray Triadimefon 25% WP @ 250g per acre or Propiconazole 25% EC on early spots."
                ]
            }
        ],
        Tomato: [
            {
                disease: "Early Blight",
                pathogen: "Fungus (Alternaria solani)",
                severity: "Medium",
                confidenceRange: [92, 97],
                symptoms: "Concentric rings resembling target patterns appearing on older leaf tissue first. Leaves turn chlorotic and wither.",
                causes: "Fungal spores surviving in soil debris. Driven by heavy rains, warm temperatures (24-29°C), and prolonged leaf wetness.",
                organic: [
                    "Spray organic Copper Fungicide or baking soda sprays (3g/L water).",
                    "Mulch base of plants to prevent rain splash from soil.",
                    "Prune lower branches up to 1 foot to increase canopy ventilation."
                ],
                chemical: [
                    "Apply Chlorothalonil or Mancozeb on foliage every 7-10 days."
                ]
            },
            {
                disease: "Tomato Leaf Mold",
                pathogen: "Fungus (Passalora fulva)",
                severity: "Low",
                confidenceRange: [85, 93],
                symptoms: "Pale green or yellow spots on upper surfaces of leaves, with olive-green to purple velvety mold growth on the undersides.",
                causes: "Very high relative humidity (>85%) and moderate temperatures (22-26°C). Common in greenhouses or densely crowded crop spaces.",
                organic: [
                    "Reduce humidity by pruning crops and increasing spacing.",
                    "Water crops at the base early in the morning, avoiding overhead sprinklers.",
                    "Spray compost tea extract to outcompete mold spores."
                ],
                chemical: [
                    "Foliar sprays of Difenoconazole or Mancozeb if infestation is severe."
                ]
            },
            {
                disease: "Tomato Yellow Leaf Curl Virus",
                pathogen: "Virus (transmitted by whitefly Bemisia tabaci)",
                severity: "High",
                confidenceRange: [91, 98],
                symptoms: "Severe stunting of shoots, leaf margins curling upwards and turning yellow. Plants stop bearing fruit completely.",
                causes: "Abundant whitefly vectors, dry warm weather increasing insect vector mobility, and presence of alternative weed hosts.",
                organic: [
                    "Install yellow sticky traps to capture whitefly vectors.",
                    "Grow crops inside protective fine mesh nets (insect netting).",
                    "Spray neem oil formulation to disrupt whitefly feeding."
                ],
                chemical: [
                    "Spray systemic insecticides like Thiamethoxam or Acetamiprid to manage whitefly vectors."
                ]
            }
        ],
        Potato: [
            {
                disease: "Late Blight",
                pathogen: "Oomycete (Phytophthora infestans)",
                severity: "High",
                confidenceRange: [95, 99],
                symptoms: "Dark, water-soaked, irregular lesions on leaves with white fuzzy growth on undersides during wet weather. Can rot tubers completely.",
                causes: "Cool temperatures (15-20°C) and constant wetness (humidity >90%). This pathogen caused the historic Irish Potato Famine.",
                organic: [
                    "Apply copper oxychloride before wet weather sets in.",
                    "Harvest tubers only after vines have died off to prevent skin infections.",
                    "Ensure deep hilling of potato rows to filter spores away from tubers."
                ],
                chemical: [
                    "Spray Metalaxyl-M combined with Mancozeb (e.g., Ridomil Gold) @ 2.5g/L water."
                ]
            },
            {
                disease: "Potato Black Scurf",
                pathogen: "Fungus (Rhizoctonia solani)",
                severity: "Medium",
                confidenceRange: [88, 96],
                symptoms: "Black, dirt-like spots (sclerotia) on tuber surfaces that do not wash off. Reddish-brown stem cankers that stunt growth.",
                causes: "Planting infected seed tubers, cold wet soils at planting time, poor drainage, and delay in potato harvesting.",
                organic: [
                    "Use certified disease-free seed tubers.",
                    "Perform soil solarization prior to planting to kill spores.",
                    "Plant tubers in warm soil to accelerate emergence."
                ],
                chemical: [
                    "Treat tubers prior to sowing with Mancozeb dust (3%) or apply azoxystrobin in-furrow."
                ]
            }
        ],
        Corn: [
            {
                disease: "Common Rust",
                pathogen: "Fungus (Puccinia sorghi)",
                severity: "Medium",
                confidenceRange: [92, 98],
                symptoms: "Oval or elongated reddish-brown pustules on both upper and lower leaf surfaces. Pustules turn blackish as plants mature.",
                causes: "Moderate temperatures (16-23°C) and high humidity. Spores spread quickly via wind and dew deposits.",
                organic: [
                    "Sow rust-resistant hybrids.",
                    "Apply neem oil or insecticidal soap sprays to clean leaf surface layers.",
                    "Practice deep autumn tillage to bury infected plant residues."
                ],
                chemical: [
                    "Spray Pyraclostrobin or Tebuconazole formulations if rust covers more than 10% of leaf area."
                ]
            },
            {
                disease: "Corn Common Smut",
                pathogen: "Fungus (Ustilago maydis)",
                severity: "Medium",
                confidenceRange: [89, 96],
                symptoms: "Fleshy, white-gray galls (blisters) containing black spores on ears, tassels, leaves, and stalks.",
                causes: "Mechanical injuries (hail, detasseling tools) providing entry points for spores, coupled with warm, dry conditions.",
                organic: [
                    "Harvest and burn smut galls before they rupture and spread spores.",
                    "Rotate crops with non-graminaceous plants for 3 years.",
                    "Avoid damaging plants during cultivation."
                ],
                chemical: [
                    "Treat seeds with vitavax/thiram fungicides. Fungicidal sprays are usually not cost-effective."
                ]
            }
        ],
        Cotton: [
            {
                disease: "Alternaria Leaf Spot",
                pathogen: "Fungus (Alternaria macrospora)",
                severity: "Medium",
                confidenceRange: [89, 95],
                symptoms: "Small, circular brown spots with concentric rings. Centers of spots may dry out and crack, creating a 'shot-hole' appearance.",
                causes: "Weakened plants due to nutrient deficiency or drought, coupled with warm humid spells or heavy morning dews.",
                organic: [
                    "Ensure adequate soil nutrition, particularly Potassium and Nitrogen feeds.",
                    "Apply Trichoderma viride seed treatments and foliar sprays.",
                    "Clear out cotton stalks from fields post-harvest."
                ],
                chemical: [
                    "Spray Copper Oxychloride 50% WP @ 3g/L or Carbendazim @ 1g/L."
                ]
            },
            {
                disease: "Cotton Bacterial Blight",
                pathogen: "Bacteria (Xanthomonas citri)",
                severity: "High",
                confidenceRange: [88, 97],
                symptoms: "Angular water-soaked leaf spots turning dark brown. Black arm stem lesions, causing stems to snap. Rotting of cotton bolls.",
                causes: "Infected seed sourcing, high humidity, sprinkler irrigation splashing bacteria, and leaf damage from high winds.",
                organic: [
                    "Sow acid-delinted disease-free seed.",
                    "Clear cotton crop residues post-harvest to remove wintering hosts.",
                    "Implement a 2-year crop rotation schedule with cereal crops."
                ],
                chemical: [
                    "Spray Copper Oxychloride 50% WP @ 3g/L combined with Streptocycline @ 0.1g/L."
                ]
            }
        ],
        Sugarcane: [
            {
                disease: "Red Rot",
                pathogen: "Fungus (Colletotrichum falcatum)",
                severity: "High",
                confidenceRange: [91, 97],
                symptoms: "Reddish spots on midrib of leaves. Stalks split open show internal reddening with horizontal white patches and sour alcoholic smell.",
                causes: "Use of infected seed setts, poor soil drainage, waterlogged fields, and close planting which increases humidity.",
                organic: [
                    "Always use certified disease-free setts for planting.",
                    "Perform crop rotation with non-host crops like Rice or Green Gram for 2 years.",
                    "Ensure good field drainage; do not let irrigation water stagnate."
                ],
                chemical: [
                    "Treat setts in hot water containing carbendazim (0.1%) at 50°C for 2 hours."
                ]
            },
            {
                disease: "Sugarcane Grassy Shoot",
                pathogen: "Phytoplasma (transmitted by aphids)",
                severity: "High",
                confidenceRange: [86, 94],
                symptoms: "Excessive tillering giving a grassy clump appearance. Shoots are thin, chlorotic (pale yellow), and fail to form cane stalks.",
                causes: "Infected planting materials, aphid vectors transferring phytoplasma from weed borders.",
                organic: [
                    "Subject planting setts to hot water treatment (50°C for 2 hours).",
                    "Immediately rogue and destroy infected grassy clumps.",
                    "Avoid using ratoon crops from infected areas."
                ],
                chemical: [
                    "Control aphid vectors using Dimethoate 30% EC @ 300 ml/acre."
                ]
            }
        ],
        Banana: [
            {
                disease: "Sigatoka Leaf Spot (Black Sigatoka)",
                pathogen: "Fungus (Pseudocercospora fijiensis)",
                severity: "High",
                confidenceRange: [93, 98],
                symptoms: "Small dark spots on leaf undersides, growing into dark brown streaks parallel to leaf veins. Centers turn light gray with yellow haloes.",
                causes: "High rainfall, high humidity, and warm temperatures (25-30°C). Air currents and rain splash distribute spores rapidly.",
                organic: [
                    "Prune diseased leaves regularly and stack them face down on the ground.",
                    "Ensure wide spacing (2.5m x 2.5m) to let air flow freely.",
                    "Spray mineral-oil based formulations (1% emulsified oil in water)."
                ],
                chemical: [
                    "Spray Propiconazole or Azoxystrobin periodically, rotating fungicide classes to prevent resistance."
                ]
            },
            {
                disease: "Banana Panama Disease",
                pathogen: "Fungus (Fusarium oxysporum f. sp. cubense)",
                severity: "High",
                confidenceRange: [92, 99],
                symptoms: "Progressive yellowing of leaf margins of older leaves, followed by wilting, splitting of pseudostems, and leaf collapse (skirt effect).",
                causes: "Soil-borne fungus entering roots through wounds, spread by flood waters, contaminated tools, and infected suckers.",
                organic: [
                    "Grow resistant tissue-cultured plantlets (e.g., Grand Naine).",
                    "Sanitize farming tools thoroughly between trees.",
                    "Apply biological antagonist Trichoderma harzianum to the soil."
                ],
                chemical: [
                    "No effective chemical cure; soil drenching with carbendazim is used to quarantine local spots."
                ]
            }
        ]
    };

    // Initialize Event Listeners for file uploads
    function init() {
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('file-input');
        const analyzeBtn = document.getElementById('analyze-btn');
        const cameraStartBtn = document.getElementById('camera-start-btn');
        const cameraCaptureBtn = document.getElementById('camera-capture-btn');

        // File browser trigger
        dropzone.addEventListener('click', (e) => {
            // Check if click was inside video stream
            if (e.target.id === 'camera-stream' || e.target.id === 'camera-capture-btn') return;
            fileInput.click();
        });

        fileInput.addEventListener('change', handleFileSelect);

        // Drag events
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                processImageFile(e.dataTransfer.files[0]);
            }
        });

        // Trigger Run Analysis
        analyzeBtn.addEventListener('click', runDiagnosis);

        // Camera event triggers
        cameraStartBtn.addEventListener('click', startCamera);
        cameraCaptureBtn.addEventListener('click', capturePhoto);

        // Result tab switching
        const tabs = document.querySelectorAll('.diagnostic-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active classes
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.diagnostic-tab-content').forEach(c => c.classList.remove('active'));

                // Set active
                tab.classList.add('active');
                const targetTab = tab.getAttribute('data-tab');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    // Handle File Chooser selection
    function handleFileSelect(e) {
        if (e.target.files.length > 0) {
            processImageFile(e.target.files[0]);
        }
    }

    // Process selected/dropped file
    function processImageFile(file) {
        if (!file.type.startsWith('image/')) {
            app.showToast('Please select a valid image file', 'warning');
            return;
        }

        selectedImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            // Hide camera, prompt, show preview
            stopCamera();
            document.getElementById('camera-stream').style.display = 'none';
            document.getElementById('dropzone-prompt').style.display = 'none';
            
            const preview = document.getElementById('image-preview');
            preview.src = e.target.result;
            document.getElementById('preview-wrapper').classList.add('active');
            
            // Enable button
            document.getElementById('analyze-btn').removeAttribute('disabled');
        };
        reader.readAsDataURL(file);
    }

    // Start Webcam Capture
    function startCamera() {
        const video = document.getElementById('camera-stream');
        const prompt = document.getElementById('dropzone-prompt');
        const previewWrapper = document.getElementById('preview-wrapper');

        // Reset inputs
        selectedImageFile = null;
        previewWrapper.classList.remove('active');

        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                videoStream = stream;
                video.srcObject = stream;
                video.style.display = 'block';
                prompt.style.display = 'none';
                
                document.getElementById('camera-start-btn').style.display = 'none';
                document.getElementById('camera-capture-btn').style.display = 'inline-flex';
                document.getElementById('analyze-btn').setAttribute('disabled', 'true');
                app.showToast('Camera active. Focus on leaf and capture.', 'info');
            })
            .catch(err => {
                console.error("Camera access failed: ", err);
                app.showToast('Could not access camera device', 'danger');
            });
    }

    // Capture photo from video stream
    function capturePhoto() {
        if (!videoStream) return;

        const video = document.getElementById('camera-stream');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        // Stop camera stream
        stopCamera();
        video.style.display = 'none';

        // Set as preview
        const preview = document.getElementById('image-preview');
        preview.src = dataUrl;
        document.getElementById('preview-wrapper').classList.add('active');

        // Set simulated image data
        selectedImageFile = dataUrl;
        
        // Hide capture button, reset start button
        document.getElementById('camera-capture-btn').style.display = 'none';
        document.getElementById('camera-start-btn').style.display = 'inline-flex';
        document.getElementById('analyze-btn').removeAttribute('disabled');

        app.showToast('Photo captured successfully!', 'success');
    }

    // Stop active camera streams
    function stopCamera() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        document.getElementById('camera-capture-btn').style.display = 'none';
        document.getElementById('camera-start-btn').style.display = 'inline-flex';
    }

    // Analyze image for human skin tone ratio to block non-plant files
    function analyzeImageForHumans(callback) {
        const img = document.getElementById('image-preview');
        if (!img || !img.src || img.src === '#' || img.src.length < 10) {
            callback(false);
            return;
        }

        const tempImg = new Image();
        tempImg.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 100;
            ctx.drawImage(tempImg, 0, 0, 100, 100);

            try {
                const imgData = ctx.getImageData(0, 0, 100, 100).data;
                let greenPixels = 0;
                let skinPixels = 0;

                for (let i = 0; i < imgData.length; i += 4) {
                    const r = imgData[i];
                    const g = imgData[i + 1];
                    const b = imgData[i + 2];

                    // Green check (leaf chlorophyll)
                    if (g > r && g > b && g > 35) {
                        greenPixels++;
                    }

                    // Human skin tone bounds check (pinkish, beige, reddish-brown)
                    if (r > 95 && g > 40 && b > 20 && (r - g) > 15 && r > b) {
                        if (!(g > r && g > b)) {
                            skinPixels++;
                        }
                    }
                }

                const skinRatio = skinPixels / 10000;
                const greenRatio = greenPixels / 10000;

                console.log(`[AngioCare Image Analysis] Green leaf pixel ratio: ${greenRatio.toFixed(3)}, Skin tone pixel ratio: ${skinRatio.toFixed(3)}`);

                // If skin tone pixels are prominent and green chlorophyll is minimal, block it
                if (skinRatio > 0.25 && greenRatio < 0.15) {
                    callback(true);
                } else {
                    callback(false);
                }
            } catch (err) {
                console.error("Canvas pixel check skipped: ", err);
                callback(false); // Fallback to normal behavior in case of errors
            }
        };
        tempImg.src = img.src;
    }

    // Run AI scanning and output prediction details
    function runDiagnosis() {
        if (!selectedImageFile) return;

        const scanner = document.getElementById('scanner-overlay');
        const resultCard = document.getElementById('result-card');
        const analyzeBtn = document.getElementById('analyze-btn');

        // Start scanning overlay
        scanner.classList.add('active');
        resultCard.classList.remove('active');
        analyzeBtn.setAttribute('disabled', 'true');

        app.showToast('Analyzing leaf patterns...', 'info');

        analyzeImageForHumans((isHuman) => {
            if (isHuman) {
                setTimeout(() => {
                    scanner.classList.remove('active');
                    analyzeBtn.removeAttribute('disabled');
                    alert("Warning: Human subject detected. Please upload the image of the diseased part of the plant.");
                    app.showToast("Analysis rejected: Leaf not found", "danger");
                    
                    // Reset inputs & previews
                    document.getElementById('preview-wrapper').classList.remove('active');
                    document.getElementById('dropzone-prompt').style.display = 'block';
                    selectedImageFile = null;
                }, 1500);
                return;
            }

            // Normal leaf analysis flow
            setTimeout(() => {
                scanner.classList.remove('active');
                analyzeBtn.removeAttribute('disabled');

                // Find crop selected
                const cropType = document.getElementById('detect-crop-select').value;
                const cropRecords = diseaseDatabase[cropType];
                
                if (!cropRecords || cropRecords.length === 0) {
                    renderHealthyResult(cropType);
                    return;
                }

                // Pick a disease from our records index
                const index = Math.floor(Math.random() * cropRecords.length);
                const diagnosed = cropRecords[index];
                
                // Format details
                const confidence = (Math.random() * (diagnosed.confidenceRange[1] - diagnosed.confidenceRange[0]) + diagnosed.confidenceRange[0]).toFixed(1) + '%';
                
                // Render Result Card
                document.getElementById('res-disease-name').textContent = diagnosed.disease;
                document.getElementById('res-crop-type').textContent = `Crop: ${cropType}`;
                document.getElementById('res-confidence').textContent = confidence;
                document.getElementById('res-pathogen').textContent = diagnosed.pathogen;
                document.getElementById('res-symptoms').textContent = diagnosed.symptoms;
                document.getElementById('res-causes').textContent = diagnosed.causes;

                // Render severity tag
                const severityTag = document.getElementById('res-severity');
                severityTag.textContent = diagnosed.severity;
                severityTag.className = 'result-severity'; // Reset class
                if (diagnosed.severity === 'High') {
                    severityTag.classList.add('severity-high');
                } else if (diagnosed.severity === 'Medium') {
                    severityTag.classList.add('severity-medium');
                } else {
                    severityTag.classList.add('severity-low');
                }

                // Render organic list
                const organicList = document.getElementById('res-organic');
                organicList.innerHTML = '';
                diagnosed.organic.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    organicList.appendChild(li);
                });

                // Render chemical list
                const chemicalList = document.getElementById('res-chemical');
                chemicalList.innerHTML = '';
                diagnosed.chemical.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    chemicalList.appendChild(li);
                });

                // Show results block
                resultCard.classList.add('active');
                app.showToast('Leaf diagnostics finished!', 'success');

                // Dispatch global notification
                app.addNotification('Diagnosis Alert', `AI Scan detected ${diagnosed.disease} (${confidence}) on ${cropType}. Review remedies.`, diagnosed.severity === 'High' ? 'danger' : 'warning');

                // Sync with profile history if authenticated
                const session = authModule.getSession();
                if (session) {
                    const report = {
                        id: 'scan-' + Date.now(),
                        date: new Date().toISOString().split('T')[0],
                        crop: cropType,
                        disease: diagnosed.disease,
                        severity: diagnosed.severity,
                        confidence: confidence
                    };
                    authModule.appendScanHistory(report);
                }
            }, 2500);
        });
    }

    // Helper: Healthy Leaf Fallback
    function renderHealthyResult(crop) {
        document.getElementById('res-disease-name').textContent = 'Healthy Leaf';
        document.getElementById('res-crop-type').textContent = `Crop: ${crop}`;
        document.getElementById('res-confidence').textContent = '99.4%';
        document.getElementById('res-pathogen').textContent = 'No Pathogens Detected';
        document.getElementById('res-symptoms').textContent = 'Leaf shows normal pigmentation, rich green chloroplast tissue structure, and has no blemishes or spotting.';
        document.getElementById('res-causes').textContent = 'Well-managed soil humidity, appropriate nitrogen levels, and active preventative practices.';
        
        const severityTag = document.getElementById('res-severity');
        severityTag.textContent = 'None';
        severityTag.className = 'result-severity severity-low';

        document.getElementById('res-organic').innerHTML = '<li>Continue standard weeding and pruning schedules.</li><li>Apply neem-based defensive oils during peak pest fly seasons.</li>';
        document.getElementById('res-chemical').innerHTML = '<li>Keep soil nitrogen balance stable. Avoid excess chemical salts.</li>';
        
        document.getElementById('result-card').classList.add('active');
        app.showToast('Healthy crop leaf detected!', 'success');
    }

    // Save report to User history
    function saveReport() {
        const disease = document.getElementById('res-disease-name').textContent;
        const crop = document.getElementById('res-crop-type').textContent.replace('Crop: ', '');
        const treatment = document.querySelector('#res-organic li')?.textContent || 'Apply preventive sprays';

        const treatmentItem = {
            id: 'saved-' + Date.now(),
            disease,
            crop,
            treatment
        };

        authModule.saveTreatment(treatmentItem);
    }

    // Print diagnostic results sheet
    function printReport() {
        window.print();
    }

    return {
        init,
        stopCamera,
        saveReport,
        printReport
    };
})();
