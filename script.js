const calculateBattleOutcome = (firstPokemon, secondPokemon) => {
    let totalScorePokemon1 = 3000;
    let totalScorePokemon2 = 3000;
    console.log(`total score for each participant ${totalScorePokemon1}, ${totalScorePokemon2} `)

    let {type1EffectivenessScore, type2EffectivenessScore } = compareTypes(firstPokemon.types[0].type.name, secondPokemon.types[0].type.name);
    totalScorePokemon1 *= type1EffectivenessScore;
    totalScorePokemon2 *= type2EffectivenessScore;
    if (totalScorePokemon1 <= 0 || totalScorePokemon2 <= 0) {
        console.log("The fight is over before it even started!");
        return;
    }
    console.log(`total score for each participant after effectiveness ${totalScorePokemon1}, ${totalScorePokemon2} `)

    let round = 1;
    const totalFirst = calculateTotalStats(firstPokemon);
    const totalSecond = calculateTotalStats(secondPokemon);
    const speed1 = calculateSpeedStats(firstPokemon);
    const speed2 = calculateSpeedStats(secondPokemon);

    while  (round <= 30 && (totalScorePokemon1 > 0 || totalScorePokemon2 > 0)) {

       
        if (speed1 > speed2) {
            // The first Pokémon attacks
            totalScorePokemon2 -= totalFirst;
            if (totalScorePokemon2 <= 0) {
                console.log(`${secondPokemon.name} has been defeated`);
                break; // End the battle
            }
        } else {
            // The second Pokémon attacks
            totalScorePokemon1 -= totalSecond;
            if (totalScorePokemon1 <= 0) {
                console.log(`${firstPokemon.name} has been defeated`);
                break; // End the battle
            }
        }

        // If both are still standing, let the other Pokémon attack
        if (speed2 >= speed1 && totalScorePokemon1 > 0) {
            totalScorePokemon1 -= totalSecond;
            if (totalScorePokemon1 <= 0) {
                console.log(`${firstPokemon.name} has been defeated`);
                break; // End the battle
            }
        }

        if (speed1 > speed2 && totalScorePokemon2 > 0) {
            totalScorePokemon2 -= totalFirst;
            if (totalScorePokemon2 <= 0) {
                console.log(`${secondPokemon.name} has been defeated`);
                break; // End the battle
            }
        }

        console.log(`Score after round ${round}: ${firstPokemon.name} has ${totalScorePokemon1}, ${secondPokemon.name} has ${totalScorePokemon2}`);
        round++;
    }
}

const compareTypes = (attackingType, defendingType) => {
    const effectivenessValues = {
        'super effective': 2,
        'normally effective': 1,
        'not very effective': 0
    };

    const effectivenessScore1 = typeEffectiveness[attackingType].strongAgainst.includes(defendingType) ?
        effectivenessValues['super effective'] :
        typeEffectiveness[attackingType].weakAgainst.includes(defendingType) ?
        effectivenessValues['not very effective'] :
        effectivenessValues['normally effective'];

    const effectivenessScore2 = typeEffectiveness[defendingType].strongAgainst.includes(attackingType) ?
        effectivenessValues['super effective'] :
        typeEffectiveness[defendingType].weakAgainst.includes(attackingType) ?
        effectivenessValues['not very effective'] :
        effectivenessValues['normally effective'];

    return {
        type1EffectivenessScore: effectivenessScore1,
        type2EffectivenessScore: effectivenessScore2,
        type1EffectivenessText: getKeyByValue(effectivenessValues, effectivenessScore1),
        type2EffectivenessText: getKeyByValue(effectivenessValues, effectivenessScore2)
    };
};

const getKeyByValue = (object, value) => {
    return Object.keys(object).find(key => object[key] === value);
};

const calculateTotalStats = (pokemon) => {
    let totalStats = 0;
    pokemon.stats.forEach((stat) => {
      totalStats += stat.base_stat;
    });
    return totalStats;
};

const calculateSpeedStats = (pokemon) => {
    let totalSpeed = 0;
    pokemon.stats.forEach((stat) => {
        if (stat.stat.name === 'speed')
        totalSpeed += stat.base_stat;
    });
    return totalSpeed;
};


const loadTypeEffectivenessData = async (types) => {
    for (const type of types) {
        const matchups = await getTypeMatchups(type);
        typeEffectiveness[type] = {
            strongAgainst: matchups.double_damage_to.map(t => t.name),
            weakAgainst: matchups.double_damage_from.map(t => t.name),
        };
    }
};
const getTypeMatchups = async (typeName) => {
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/type/${typeName}`);
        return response.data.damage_relations; 
    } catch (error) {
        console.error(`Error fetching data for type ${typeName}:`, error);
        return null; 
    }
};
const getAllPokemonTypes = async () => {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/type/');
        const types = response.data.results.map(type => type.name);
        return types;
    } catch (error) {
        console.error('Error fetching Pokémon types:', error);
        return [];
    }
};
const getPokemon = async(pokename) => {
    try{
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokename}`);
        return response.data
    }catch(e) {
        console.log(e);
    }
}

const getTotalPokemonCount = async () => {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon/');
        return response.data.count;
    } catch (error) {
        console.error('Error fetching total Pokémon count:', error);
        return 0;
    }
};

async function displayPokemon(value) {
    return await getPokemon(value);
}

const getRandomPokemon = async () => {
    const totalPokemon = await getTotalPokemonCount(); // Assume this returns the total count correctly
    let retries = 10; // Set a maximum number of retries
    while (retries > 0) {
        const randomId = Math.floor(Math.random() * totalPokemon) + 1;
        try {
            const pokemon = await getPokemon(randomId);
            if (pokemon && pokemon.sprites) { // Check if the fetched object has sprites property
                return pokemon;
            } else {
                throw new Error('Invalid Pokémon data'); // Throw an error to trigger the catch block
            }
        } catch (error) {
            console.log(`No Pokémon found at ID ${randomId} or invalid data, retrying...`);
            retries--; // Decrement the retries counter
        }
    }
    throw new Error('Failed to find a valid Pokémon after several attempts');
};

const gameChoice = async (pokemon1, secondPlayerType) => {
    const first = await displayPokemon(pokemon1);
    let second;

    if (secondPlayerType === 'player') {
        second = await displayPokemon(document.getElementById('secondPlayer').value);
    } else {
        second = await getRandomPokemon();
    }

    return { first, second };
};

const secondPlayerChoice = document.querySelector('.choice');
const hiddenValue = document.querySelector('.hidden');
const game = document.querySelector('.form');
const firstPlayer = document.querySelector('.pokemon1');
const secondPlayer = document.querySelector('.pokemon2');
const img1 = document.querySelector('.pokemon1-image');
const img2 = document.querySelector('.pokemon2-image');
const name1 = document.querySelector('.pokemon1-name');
const name2 = document.querySelector('.pokemon2-name');
const attackEffectiveness = document.querySelector('.attack__effectiveness-answer')
const attackStats = document.querySelector('.attack__stats-answer')
const attackSpeed = document.querySelector('.attack__speed-answer')
const typeEffectiveness = {};

secondPlayerChoice.addEventListener('change', (e) => {
    if (secondPlayerChoice.value === 'computer') {
        hiddenValue.style.display = 'none';
    } else {
        hiddenValue.style.display = 'block';
    }
})

game.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pokemon1 = firstPlayer.value;
    const secondPlayerType = secondPlayerChoice.value;
    try {
        const { first, second } = await gameChoice(pokemon1, secondPlayerType);
        img1.src = first.sprites.front_default;
        const type1 = first.types[0].type.name;
        img2.src = second.sprites.front_default;
        const type2 = second.types[0].type.name;
        const firstPokemon = first.name;
        const secondPokemon = second.name;
        const totalStatsFirstPokemon = calculateTotalStats(first);
        const totalStatsSecondPokemon = calculateTotalStats(second);
        const FirstSpeed = calculateSpeedStats(first);
        const SecondSpeed = calculateSpeedStats(second);
        name1.innerText =`First Player is ${firstPokemon} and its types is ${type1}`;
        name2.innerText =`Second Player is ${secondPokemon} and its types is ${type2}`;
        const types = await getAllPokemonTypes(); // Make sure to await this call
        await loadTypeEffectivenessData(types); // Pass the types array
        console.log(first, second);
        const {type1EffectivenessText, type2EffectivenessText } = compareTypes(type1, type2);
        attackEffectiveness.innerText = `${firstPokemon}'s attack is ${type1EffectivenessText} against ${secondPokemon} and ${secondPokemon}'s attack is ${type2EffectivenessText} against ${firstPokemon}`;
        attackStats.innerText = totalStatsFirstPokemon >= totalStatsSecondPokemon ?
        `${first.name} seems stronger overall with total stats of ${totalStatsFirstPokemon} and ${second.name} has only ${totalStatsSecondPokemon}` :
        `${second.name} seems stronger overall with total stats of ${totalStatsSecondPokemon} and ${first.name} has only ${totalStatsFirstPokemon}`;
        attackSpeed.innerText = FirstSpeed >= SecondSpeed ?
        `${first.name} will attack first ${FirstSpeed} since ${second.name} has only ${SecondSpeed}` :
        `${second.name} will attack first ${SecondSpeed} since ${first.name} has only ${FirstSpeed}`;
        calculateBattleOutcome(first,second);
    } catch (error) {
        console.error('Error in gameChoice:', error);
    }
});