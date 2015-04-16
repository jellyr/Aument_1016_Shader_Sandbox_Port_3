uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

float rand(vec2 co){
	return fract(tan(dot(co.xy ,vec2(13.9898,78.233))) * 758.5453);
}

void main( void )
{
	vec2 pos = gl_FragCoord.xy / resolution.xy;
	vec2 uPos = pos;
	if (mouse.x > 0.0 && mouse.y > 0.0){
		uPos -= vec2(0.5,0.5);
	}else{
		uPos.y -= 0.5;
	}

	vec3 color = vec3(0.0);
	float vertColor = 0.0;
	const float k = 50.;
	for( float i = 1.0; i < k; ++i )
	{
		float t = time * (1.0);

		uPos.y += sin( uPos.x*exp(i) - t) * 0.2;
		float fTemp = abs(1.0/(50.0*k) / uPos.y);
		vertColor += fTemp;
		color += vec3( fTemp*(i*0.05), fTemp*i/k, pow(fTemp,0.85)*1.9 );
	}

	vec4 color_final = vec4(color, 1.0);
	gl_FragColor = color_final;
	float ft = fract(time);
	gl_FragColor.rgb += vec3( rand( pos +  7.+ ft ),
				  rand( pos +  9.+ ft ),
				  rand( pos + 11.+ ft ) ) / 32.0;
}