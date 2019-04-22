using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class CountDown : MonoBehaviour {
	public Text text;

	void Update(){
		ResumeIn5 ();
	}

	void ResumeIn5(){
			StartCoroutine (Counter (6));
	}

	private IEnumerator Counter(int resumeTime){
		Time.timeScale = 0.0001f;
		float pauseEndTime = Time.realtimeSinceStartup + resumeTime;
		float number5 = Time.realtimeSinceStartup + 1;
		float number4 = Time.realtimeSinceStartup + 2;
		float number3 = Time.realtimeSinceStartup + 3;
		float number2 = Time.realtimeSinceStartup + 4;
		float number1 = Time.realtimeSinceStartup + 5;
		float number0 = Time.realtimeSinceStartup + 6;
		float numberNegOne = Time.realtimeSinceStartup + 7;

		while (Time.realtimeSinceStartup < pauseEndTime) {
			if (Time.realtimeSinceStartup <= number5)
				text.text = "5";
			else if (Time.realtimeSinceStartup <= number4)
				text.text = "4";
			else if (Time.realtimeSinceStartup <= number3)
				text.text = "3";
			else if (Time.realtimeSinceStartup <= number2)
				text.text = "2";
			else if (Time.realtimeSinceStartup <= number1)
				text.text = "1";
			else if (Time.realtimeSinceStartup <= number0) 
				text.text = "Start!";

			yield return null;
		}
		text.gameObject.SetActive (false);
		Time.timeScale = 1;
	}
}
