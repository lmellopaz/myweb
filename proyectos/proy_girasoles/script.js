window.onload = function() {
    const sunflowers = document.querySelectorAll('.sunflower');
    
    sunflowers.forEach(sunflower => {
        // Generar el tallo debajo del girasol
        const stem = document.createElement('div');
        stem.classList.add('stem');
        sunflower.parentElement.appendChild(stem);

        // Calcular el centro del girasol
        const sunflowerCenterX = sunflower.offsetLeft + sunflower.clientWidth / 2;
        const sunflowerCenterY = sunflower.offsetTop + sunflower.clientHeight / 2;

        // Generar entre 7 y 15 hojas para el girasol
        const numLeaves = Math.floor(Math.random() * 9) + 7;
        
        for (let i = 0; i < numLeaves; i++) {
            const leaf = document.createElement('div');
            leaf.classList.add('leaf');
            
            const leafColors = ['#ffeb3b', '#fdd835', '#fbc02d'];
            const randomColor = leafColors[Math.floor(Math.random() * leafColors.length)];
            leaf.style.borderBottomColor = randomColor;
            
            // Calcular la posición de la hoja
            const angle = (i * 360 / numLeaves);
            const radius = 75; // Radio para la distribución de las hojas
            const leafX = sunflowerCenterX + (radius * Math.cos(angle * Math.PI / 180));
            const leafY = sunflowerCenterY + (radius * Math.sin(angle * Math.PI / 180));
            leaf.style.transform = `rotate(${angle}deg) translateY(30px)`;
            // Ajustar la posición para que la base de la hoja esté en la circunferencia del girasol
            leaf.style.left = `${leafX - 20}px`; // Ajustar para el ancho de la hoja
            leaf.style.top = `${leafY - 20}px`; // Ajustar para la altura de la hoja
            
            sunflower.appendChild(leaf);
        }

        // Generar un número aleatorio de abejas entre 1 y 3
        const numBees = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numBees; i++) {
            const bee = document.createElement('div');
            bee.classList.add('bee');

            const stripe = document.createElement('div');
            stripe.classList.add('stripe');
            bee.appendChild(stripe);

            const randomX = Math.random() * (sunflower.clientWidth + 20) - 10;
            const randomY = Math.random() * (sunflower.clientHeight + 20) - 10;

            bee.style.left = `${randomX}px`;
            bee.style.top = `${randomY}px`;

            sunflower.appendChild(bee);
        }

        // Generar hojas para el tallo
        const numStemLeaves = 2;
        const leafColors = ['#228b22', '#2e8b57', '#006400'];

        for (let i = 0; i < numStemLeaves; i++) {
            const leaf = document.createElement('div');
            leaf.classList.add('leaf');
            
            const randomColor = leafColors[Math.floor(Math.random() * leafColors.length)];
            leaf.style.borderBottomColor = randomColor;
            
            const leafPosition = Math.random() * 75 + 150; // Aleatorio entre 150px y 225px del tallo
            leaf.style.bottom = `${leafPosition}px`;

            if (i === 0) {
                leaf.style.left = '25px'; 
                leaf.style.transform = 'rotate(-45deg)';
            } else {
                leaf.style.right = '25px'; 
                leaf.style.transform = 'rotate(45deg)';
            }

            stem.appendChild(leaf);
        }
    });

    // Crear girasoles en el título
    const titleSunflowers = document.querySelectorAll('.title-sunflower');
    const numTitleFlowers = 0; // Entre 4 y 7 girasoles

    for (let i = 0; i < numTitleFlowers; i++) {
        const titleSunflower = document.createElement('div');
        titleSunflower.classList.add('title-sunflower');
        document.querySelector('.title-container').insertBefore(titleSunflower, document.querySelector('.title'));

        const center = document.createElement('div');
        center.classList.add('sunflower-center');
        titleSunflower.appendChild(center);
    }
};
