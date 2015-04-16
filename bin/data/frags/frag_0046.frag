uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;


void main( void )
{

	vec2 uPos = ( gl_FragCoord.xy / resolution.xy );//normalize wrt y axis
	//uPos -= vec2((resolution.x/resolution.y)/2.0, 0.0);//shift origin to center
	
	uPos.x -= 0.5;
	
	float vertColor = 0.0;
	for( float i = 0.0; i < 10.0; ++i )
	{
		float t = time * (i + 0.9* uPos.y * uPos.x);
	
		uPos.x += cos( uPos.y + t ) * 0.1080;
	
		float fTemp = abs(1.0 / uPos.x / 100.0);
		vertColor += fTemp;
	}
	
	vec4 color = vec4( vertColor*0.5, vertColor * sin(time), vertColor * 2.5, 1.0 );
	gl_FragColor = color;
}