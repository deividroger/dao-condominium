import { ethers, run } from "hardhat";

async function main() {
    
    const implementation = await ethers.deployContract("Condominium");
    await implementation.waitForDeployment();

    const implementationAddress = await implementation.getAddress();
    console.log("Condominium implementation deployed to:", implementationAddress);

    const adapter = await ethers.deployContract("CondominiumAdapter");
    await adapter.waitForDeployment();

    const adapterAddress = await adapter.getAddress();
    console.log("CondominiumAdapter deployed to:", adapterAddress);

    await adapter.upgrade(implementationAddress);
    console.log("CondominiumAdapter upgraded to implementation at:", implementationAddress);

    console.log("Deployment and upgrade completed successfully.");

}

main().catch((error) => {
    console.error("Error during deployment:", error);
    process.exitCode = 1;
});