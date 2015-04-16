// blobbies - by @P_Malin
// By @P_Malin
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

float k_PI = 3.141592654;
float k_MoveSpeed = 0.5;
float k_BlobSize = 0.5;
float k_OrbitRadius = 0.5;

vec2 GetRandom2( in vec2 vInput ){
	vec2 temp1 = vInput * vec2(17.1232, 33.32432);
	vec2 temp2 = vInput * vec2(34.32432, 12.9742);
	vec2 temp3 = vec2(sin(temp1.x) + sin(temp2.y), sin(temp1.y) + sin(temp2.x)) * 121.1231;
	return fract(temp3);
}

vec2 GetOffset2( in vec2 vInput ){
	return vec2(sin(vInput.x * k_PI * 2.0), cos(vInput.y * k_PI * 2.0));
}

float BlobTexture( in vec2 vPos ){
	float fLen = length(vPos) / k_BlobSize;
	return max(1.0 - fLen, 0.0);
}

float GetBlobValue( in vec2 vPosition, in vec2 vTileOffset ){
	vec2 vTilePos = floor(vPosition - vTileOffset);

	vec2 vRandom = GetRandom2(vTilePos);
	vec2 vTime2d = vec2(time, time * 0.92312) * k_MoveSpeed;

	vec2 vBlobPos = GetOffset2(vRandom + vTime2d) * k_OrbitRadius;

	vec2 vSubTilePos = fract(vPosition) + vTileOffset;

	return BlobTexture(vSubTilePos - vBlobPos);
}

vec3 GetColour( in vec2 vPixelPosition ){
	vec2 vPosition = vPixelPosition;

	float fValue = 0.0;

	fValue += GetBlobValue( vPosition, vec2( 0.0, 0.0 ) );
	fValue += GetBlobValue( vPosition, vec2( -1.0, 0.0 ) );
	fValue += GetBlobValue( vPosition, vec2( 0.0, -1.0 ) );
	fValue += GetBlobValue( vPosition, vec2( -1.0, -1.0 ) );

	fValue = max(fValue, 0.0);
	fValue = 1.0 - abs(0.7 - fValue);
	fValue = max(fValue, 0.0);

	fValue = pow(fValue, 1.5);

	vec3 cColA = vec3(1.0, 0., 0.4);
	vec3 cColB = vec3(0., 0.0, 0.0);

	return cColA * fValue + cColB * (1.0 - fValue);
}

void main( void ) {
	vec3 vOutputColour = GetColour(gl_FragCoord.xy * ( mouse.x / 8.0 ));

	gl_FragColor = vec4( vOutputColour, 1.0 );
}

