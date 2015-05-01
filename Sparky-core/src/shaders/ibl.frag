#version 330 core

layout (location = 0) out vec4 color;

in DATA
{
	vec3 position;
	vec3 camera_pos;
	vec3 normal;
	vec2 uv;
	float tid;
	vec4 color;

	vec3 reflectDir;
	vec3 reflectNormal;
} fs_in;

uniform sampler2D textures[32];

//uniform samplerCube specularEnvMap;
uniform samplerCube diffuseEnvMap;

void calculatePointLightEnergy(out vec3 color, out vec3 direction, in vec3 surfacePos, in vec3 lightPosition, in vec3 lightColor)
{
	vec3 lightVector = lightPosition - surfacePos;
	direction = normalize(lightVector);
	color = lightColor / (1.0 + dot(lightVector, lightVector));
}

void BRDF(inout vec3 diffuse, inout vec3 specular, vec3 normal, vec3 color, vec3 direction, vec3 view, float gloss)
{
	vec3 halfAngle = normalize(direction + view);
	float specPower = pow(max(dot(normal, halfAngle), 0), gloss);
	specular += color * specPower * sqrt(gloss) / 3.0;
	diffuse += max(dot(normal, direction), 0) * color;
}

void main()
{
	vec3 diffuseColor = vec3(texture(diffuseEnvMap, normalize(fs_in.reflectNormal)));
	//vec3 specularColor = vec3(texture(specularEnvMap, normalize(fs_in.reflectDir)));

	vec3 baseColor = fs_in.color.xyz;
	vec3 c = mix(baseColor, diffuseColor, 1.0);
	
	vec3 diffuse = vec3(0.1, 0.1, 0.1);
	vec3 specular = vec3(0, 0, 0);

	vec3 surfaceNormal = normalize(fs_in.normal);
	vec3 viewVector = normalize(fs_in.camera_pos - fs_in.position);

	vec3 lightColor;
	vec3 lightDirection;

	float gloss = 1000;

	vec3 l0 = vec3(1, 1, 1); // vec3(0.2, 0.3, 0.8);
	// vec3 l1 = vec3(0.8, 0.3, 0.2);

	calculatePointLightEnergy(lightColor, lightDirection, fs_in.position, vec3(-5, 5, 0), l0 * 25);
	BRDF(diffuse, specular, surfaceNormal, lightColor, lightDirection, viewVector, gloss);

	// calculatePointLightEnergy(lightColor, lightDirection, fs_in.position, vec3(5, 5, 0), l1 * 25);
	// BRDF(diffuse, specular, surfaceNormal, lightColor, lightDirection, viewVector, gloss);

	color = sqrt(vec4(diffuse * c + specular, fs_in.color.a));
}