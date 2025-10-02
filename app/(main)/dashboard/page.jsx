import React from 'react'
import FeatureAssistant from './_components/FeatureAssistant'
import Feedback from './_components/Feedback'
import History from './_components/History'
import { BlurFade } from '@/components/ui/blur-fade'

function Dashboard() {
  return (
    <div>
        <FeatureAssistant/>
          <BlurFade delay={2.0} inView>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-10 mt-10'>
              <History/>
              <Feedback/>
            </div>
          </BlurFade>
    </div>
  )
}

export default Dashboard