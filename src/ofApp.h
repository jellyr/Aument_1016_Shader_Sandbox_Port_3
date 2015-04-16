#pragma once

#include "ofMain.h"
#include "pingPongBuffer.h"

class ofApp : public ofBaseApp{

	public:

        void setup();
        void update();
        void draw();
        void keyPressed  (int key);
        void mouseMoved(int x, int y );
        void mouseDragged(int x, int y, int button);
        void mousePressed(int x, int y, int button);
        void mouseReleased(int x, int y, int button);
        void windowResized(int w, int h);
		void dragEvent(ofDragInfo dragInfo);
		void gotMessage(ofMessage msg);

        // Shader Sand Box
        void updateShader(int i);
        bool setCode(string _fragShader);
        bool compileCode();

        // Global Settings
        bool                    show_fps;
        int                     resolHoriz;
        int                     resolVert;
        bool                    bHideCursor;

        // Kaleidoscope
        ofFbo                   pantallaFBOKaleidoscopeA;
        ofFbo                   pantallaFBOKaleidoscopeB;
        ofFbo                   pantallaFBOKaleidoscopeC;
        ofFbo                   pantallaCompletaParaSyphon;
        int                     resolPantalla;
        float                   KaleidoscopeSlices;
        ofFbo                   *textures;
        ofShader                shader;
        pingPongBuffer          pingPong;
        vector<string>          frags;
        vector<string>          fragNames;
        string                  fragmentShader;
        int                     nTextures;
        int                     nFrag;
        int                     passes;
        bool                    bFine;
        bool                    bKaleidoscope;

};

