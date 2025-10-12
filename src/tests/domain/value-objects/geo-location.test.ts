import GeoLocation from "../../../domain/value-objects/GeoLocation";

describe("GeoLocation", () => {
    it("should create a GeoLocation instance with valid latitude and longitude", () => {
        const latitude = 40.7128;
        const longitude = -74.006;

        // Criar uma instância de GeoLocation com valores válidos
        const geoLocation = GeoLocation.create(latitude, longitude);

        // Verificar se a instância é de GeoLocation
        expect(geoLocation).toBeInstanceOf(GeoLocation);

        // Verificar se a latitude e longitude estão corretas
        expect(geoLocation.latitude).toBe(latitude); // Acessando diretamente a latitude
        expect(geoLocation.longitude).toBe(longitude); // Acessando diretamente a longitude
    });

    it("should create a GeoLocation instance with boundary latitude and longitude values", () => {
        const boundaryValues = [
            { latitude: 90, longitude: 0 }, // Latitude máxima (norte) e longitude zero
            { latitude: -90, longitude: 0 }, // Latitude mínima (sul) e longitude zero
            { latitude: 0, longitude: 180 }, // Latitude zero e longitude máxima (leste)
            { latitude: 0, longitude: -180 }, // Latitude zero e longitude mínima (oeste)
        ];

        boundaryValues.forEach(({ latitude, longitude }) => {
            const geoLocation = GeoLocation.create(latitude, longitude);

            // Verificar se a instância é de GeoLocation
            expect(geoLocation).toBeInstanceOf(GeoLocation);
            expect(geoLocation.latitude).toBe(latitude);
            expect(geoLocation.longitude).toBe(longitude);
        });
    });

    it("should create a GeoLocation instance with negative latitude and longitude values", () => {
        const latitude = -23.5505; // Exemplo de coordenadas no hemisfério sul
        const longitude = -46.6333; // Exemplo de coordenadas no hemisfério oeste

        const geoLocation = GeoLocation.create(latitude, longitude);

        // Verificar se a instância é de GeoLocation
        expect(geoLocation).toBeInstanceOf(GeoLocation);
        expect(geoLocation.latitude).toBe(latitude);
        expect(geoLocation.longitude).toBe(longitude);
    });
});
