/** Rename vars */
var Neat = neataptic.Neat;
var Methods = neataptic.Methods;
var Config = neataptic.Config;
var Architect = neataptic.Architect;

/** Turn off warnings */
Config.warnings = false;

// GA settings
var BOT_AMOUNT = 30;
var START_HIDDEN_SIZE = 0;
var MUTATION_RATE = 0.05;
var ELITISM_PERCENT = 0.1;

// // Global vars
// pretrained_population

// var prevavg = -100000;
// var prevbest = -100000;

class NEAT{
    constructor(world) {
        this.world = world;
        this.bots = [];
        const len_input = 6;
        const len_output = 4;
        this.neat = new Neat(len_input, len_output,
            null,
            {
                mutation: [
                    Methods.Mutation.ADD_NODE,
                    Methods.Mutation.SUB_NODE,
                    Methods.Mutation.ADD_CONN,
                    Methods.Mutation.SUB_CONN,
                    Methods.Mutation.MOD_WEIGHT,
                    Methods.Mutation.MOD_BIAS,
                    Methods.Mutation.MOD_ACTIVATION,
                    Methods.Mutation.ADD_GATE,
                    Methods.Mutation.SUB_GATE,
                    Methods.Mutation.ADD_SELF_CONN,
                    Methods.Mutation.SUB_SELF_CONN,
                    Methods.Mutation.ADD_BACK_CONN,
                    Methods.Mutation.SUB_BACK_CONN
                ],
                popsize: BOT_AMOUNT,
                mutationRate: MUTATION_RATE,
                elitism: Math.round(ELITISM_PERCENT * BOT_AMOUNT),
                network: new Architect.Random(
                    len_input,
                    START_HIDDEN_SIZE,
                    len_output
                )
            }
        );
    };

    /** Start the evaluation of the current generation */
    startEvaluation() {
        // destroy all players
        this.bots.forEach((bot) => {
            bot.kill();
        });

        this.bots = [];

        const y = (this.world.vtcl.max + this.world.vtcl.min) / 2;
        const hztl = this.world.hztl;
        for (var genome in this.neat.population) {
            genome = this.neat.population[genome];
            const x = Math.round(Math.random() * (hztl.max - hztl.min) / 7 + hztl.min);
            var bot = new RobotNeat(genome, this.world, 1, x, y);
            this.bots.push(bot);
        }

        // TODO: start bot movement
        this.bots.forEach((bot) => {
            bot.start();
        });
    };

    /** End the evaluation of the current generation */
    endEvaluation() {
        this.neat.sort();

        this.updateStats();

        var newPopulation = [];

        // Elitism
        for (var i = 0; i < this.neat.elitism; i++) {
            newPopulation.push(this.neat.population[i]);
        }

        // Breed the next individuals
        for (var i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
            newPopulation.push(this.neat.getOffspring());
        }

        // Replace the old population with the new population
        this.neat.population = newPopulation;
        this.neat.mutate();

        this.neat.generation++;
        this.startEvaluation();
    };

    updateStats(){
        updateUI("generation", parseInt(this.neat.generation + 1).toString());
        updateUI("score", this.neat.getAverage().toFixed(2).toString());
        updateUI("mrate", parseInt(this.neat.mutationRate * 100).toString() + '%');
        updateUI("maxscore", this.neat.population[0].score.toFixed(2).toString());
        
                // if (prevavg < this.neat.getAverage() && prevbest < this.neat.population[0].score) {
        //     const saved_weights = [];
        //     this.neat.population.forEach((pop) => {
        //         const popjon = pop.toJSON();
        //         saved_weights.push(popjon);
        //     });
        //     console.log(saved_weights);
        // }

        // prevavg = this.neat.getAverage();
        // prevbest = this.neat.population[0].score;
    }
};